'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Customer, CustomerInput, Note } from '@/types';
import { formatDate } from '@/lib/utils';

// müşteri detay sayfası bileşeni - müşteri düzenleme ve not yönetimi
export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // müşteri ve form state'leri
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerInput>({
    name: '',
    email: '',
    phone: '',
    tags: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // etiket yönetimi state'leri
  const [tagInput, setTagInput] = useState('');
  // notlar state'leri
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');

  // sayfa yüklendiğinde müşteri ve notları getir
  useEffect(() => {
    fetchCustomer();
    fetchNotes();
  }, [params.id]);

  // müşteri bilgilerini api'den çek - token ile kimlik doğrulama
  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // müşteri detay api endpoint'ine get isteği gönder
      const response = await fetch(`/api/customers/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.data);
        // form verilerini müşteri bilgileriyle doldur
        setFormData({
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone,
          tags: data.data.tags || []
        });
      } else {
        setError('Müşteri bulunamadı');
      }
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // müşteri notlarını api'den çek
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // notlar api endpoint'ine get isteği gönder - customerId parametresi ile
      const response = await fetch(`/api/notes?customerId=${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.data || []);
      }
    } catch (err) {
      console.error('Notlar alınamadı:', err);
    }
  };

  // müşteri güncelleme form gönderimi - api'ye put isteği gönderir
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // müşteri güncelleme api endpoint'ine put isteği gönder
      const response = await fetch(`/api/customers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setCustomer(data.data);
        setError('');
      } else {
        setError(data.error || 'Müşteri güncellenemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  // form input değişikliklerini yakala - controlled component
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // etiket ekleme fonksiyonu - benzersiz etiketler
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  // etiket silme fonksiyonu
  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // müşteri silme fonksiyonu - onay ile silme
  const handleDeleteCustomer = async () => {
    if (!confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // müşteri silme api endpoint'ine delete isteği gönder
      const response = await fetch(`/api/customers/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        router.push('/customers');
      } else {
        setError('Müşteri silinemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu');
    }
  };

  // not ekleme fonksiyonu - api'ye post isteği gönderir
  const addNote = async () => {
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // not ekleme api endpoint'ine post isteği gönder
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newNote.trim(),
          customerId: params.id
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // yeni notu listenin başına ekle
        setNotes([data.data, ...notes]);
        setNewNote('');
      }
    } catch (err) {
      console.error('Not eklenemedi:', err);
    } finally {
      setAddingNote(false);
    }
  };

  // not güncelleme fonksiyonu - api'ye put isteği gönderir
  const updateNote = async (noteId: string) => {
    if (!editNoteContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // not güncelleme api endpoint'ine put isteği gönder
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: editNoteContent.trim()
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // güncellenmiş notu state'e ekle
        setNotes(notes.map(note => 
          note._id === noteId ? data.data : note
        ));
        setEditingNote(null);
        setEditNoteContent('');
      }
    } catch (err) {
      console.error('Not güncellenemedi:', err);
    }
  };

  // not silme fonksiyonu - onay ile silme
  const deleteNote = async (noteId: string) => {
    if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // not silme api endpoint'ine delete isteği gönder
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // silinen notu state'den çıkar
        setNotes(notes.filter(note => note._id !== noteId));
      }
    } catch (err) {
      console.error('Not silinemedi:', err);
    }
  };

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

  // müşteri bulunamadı durumu
  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Müşteri bulunamadı</p>
          <Link href="/customers" className="text-emerald-700 hover:text-emerald-900 mt-2 inline-block">
            Müşteri listesine dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* header bölümü - navigasyon ve silme butonu */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 space-y-4 sm:space-y-0">
            {/* geri butonu ve başlık */}
            <div className="flex items-center">
              <Link href="/customers" className="text-gray-500 hover:text-gray-700 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Müşteri Düzenle</h1>
            </div>
            {/* müşteri silme butonu */}
            <button
              onClick={handleDeleteCustomer}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors self-end sm:self-auto"
            >
              Müşteriyi Sil
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* müşteri formu bölümü */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Müşteri Bilgileri</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ad soyad input alanı */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Ad Soyad *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* email input alanı */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* telefon input alanı */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* etiketler bölümü */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiketler
                  </label>
                  {/* etiket ekleme input'u */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Etiket ekle..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 border border-blue-200 transition-colors"
                    >
                      Ekle
                    </button>
                  </div>
                  {/* mevcut etiketler listesi */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-800 hover:text-blue-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* hata mesajı gösterimi */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* kaydet butonu */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 border border-emerald-200 rounded-md shadow-sm text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>

            {/* notlar bölümü */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Notlar</h2>
              
              {/* not ekleme bölümü */}
              <div className="mb-6">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Yeni not ekle..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={addNote}
                    disabled={addingNote || !newNote.trim()}
                    className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-md hover:bg-emerald-200 border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingNote ? 'Ekleniyor...' : 'Not Ekle'}
                  </button>
                </div>
              </div>

              {/* notlar listesi */}
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note._id} className="border border-gray-200 rounded-lg p-4">
                    {editingNote === note._id ? (
                      // not düzenleme modu
                      <div>
                        <textarea
                          value={editNoteContent}
                          onChange={(e) => setEditNoteContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                        {/* düzenleme aksiyon butonları */}
                        <div className="mt-2 flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingNote(null);
                              setEditNoteContent('');
                            }}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800"
                          >
                            İptal
                          </button>
                          <button
                            onClick={() => updateNote(note._id)}
                            className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 border border-emerald-200"
                          >
                            Kaydet
                          </button>
                        </div>
                      </div>
                    ) : (
                      // not görüntüleme modu
                      <div>
                        <p className="text-gray-900 mb-2">{note.content}</p>
                        {/* not meta bilgileri ve aksiyon butonları */}
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{formatDate(note.createdAt)}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingNote(note._id);
                                setEditNoteContent(note.content);
                              }}
                              className="text-emerald-700 hover:text-emerald-900"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => deleteNote(note._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* boş not durumu */}
                {notes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Henüz not eklenmemiş</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 