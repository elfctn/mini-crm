'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Customer } from '@/types';
import { useAuth } from '@/providers/AuthProvider';

// müşteriler sayfası ana bileşeni - müşteri listesi yönetimi
export default function CustomersPage() {
  // müşteri listesi state'i - api'den gelen veriler
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // arama ve filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { user, logout } = useAuth();

  // sayfa yüklendiğinde müşteri listesini getir
  useEffect(() => {
    fetchCustomers();
  }, []);

  // müşteri listesini api'den çek - token ile kimlik doğrulama
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      // customers api endpoint'ine get isteği gönder
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      } else {
        setError('Müşteri listesi alınamadı');
      }
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // çıkış yap fonksiyonu - auth provider'dan
  const handleLogout = () => {
    logout();
  };

  return (
    <CustomersContent 
      customers={customers}
      loading={loading}
      error={error}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedTags={selectedTags}
      setSelectedTags={setSelectedTags}
      user={user}
      handleLogout={handleLogout}
    />
  );
}

// müşteriler içerik bileşeni - ui render ve filtreleme mantığı
function CustomersContent({ 
  customers, 
  loading, 
  error, 
  searchTerm, 
  setSearchTerm, 
  selectedTags, 
  setSelectedTags, 
  user, 
  handleLogout 
}: {
  customers: Customer[];
  loading: boolean;
  error: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
  user: any;
  handleLogout: () => void;
}) {

  // müşteri filtreleme - arama terimi ve etiketlere göre
  const filteredCustomers = customers.filter(customer => {
    // arama terimi kontrolü - isim ve email'de ara
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // etiket filtreleme - seçili etiketlerden en az biri eşleşmeli
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => customer.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // tüm benzersiz etiketleri topla - filtreleme için
  const allTags = Array.from(new Set(customers.flatMap(c => c.tags)));

  // loading durumunda spinner göster
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* header bölümü - navigasyon ve kullanıcı bilgileri */}
      <header className="bg-white/90 backdrop-blur-sm shadow border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            {/* logo ve marka adı */}
            <div className="flex items-center space-x-3">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Mini CRM</h1>
            </div>
            {/* kullanıcı profili ve çıkış butonu */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              {user && (
                <Link href="/profile" className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors">
                  {/* profil avatar'ı */}
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profil fotoğrafı"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  {/* kullanıcı bilgileri */}
                  <div className="text-sm">
                    <p className="text-gray-900 font-medium">{user.name || user.email}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                </Link>
              )}
              {/* çıkış yap butonu */}
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full sm:w-auto"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* sayfa başlığı ve aksiyon butonları */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Müşteriler</h2>
            {/* navigasyon butonları */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Link
                href="/notes"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center shadow-sm border border-transparent"
              >
                Tüm Notlar
              </Link>
              <Link
                href="/customers/new"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors text-center"
              >
                Yeni Müşteri Ekle
              </Link>
            </div>
          </div>

          {/* arama ve filtreleme bölümü */}
          <div className="mb-6 space-y-4">
            {/* arama input'u */}
            <div>
              <input
                type="text"
                placeholder="Müşteri ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* etiket filtreleme */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiketlere göre filtrele:
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags((prev: string[]) => 
                          prev.includes(tag) 
                            ? prev.filter((t: string) => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* hata mesajı gösterimi */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* müşteri listesi */}
          {filteredCustomers.length === 0 ? (
            // boş durum mesajları
            <div className="text-center py-12">
              <div className="text-gray-500">
                {customers.length === 0 ? (
                  <>
                    <p className="text-lg font-medium mb-2">Henüz müşteri yok</p>
                    <p>İlk müşterinizi ekleyerek başlayın!</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-medium mb-2">Sonuç bulunamadı</p>
                    <p>Arama kriterlerinizi değiştirmeyi deneyin.</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            // müşteri kartları grid'i
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCustomers.map((customer) => (
                <div key={customer._id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    {/* müşteri başlığı ve düzenleme butonu */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {customer.name}
                      </h3>
                      <div className="flex space-x-2">
                        <Link
                          href={`/customers/${customer._id}`}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Düzenle
                        </Link>
                      </div>
                    </div>
                    
                    {/* müşteri iletişim bilgileri */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{customer.email}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="truncate">{customer.phone}</span>
                      </div>
                    </div>

                    {/* müşteri etiketleri */}
                    {customer.tags && customer.tags.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-1">
                          {customer.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 