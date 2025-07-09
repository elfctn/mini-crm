'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Note, Customer } from '@/types';
import { ProtectedRoute } from '@/providers/ProtectedRoute';
import { useAuth } from '@/providers/AuthProvider';

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchNotes();
    fetchCustomers();
  }, []);

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // tüm notları tek seferde al
      const response = await fetch('/api/notes/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotes(data.data || []);
      } else {
        setError('Notlar alınamadı');
      }
    } catch (err) {
      setError('Notlar alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      }
    } catch (err) {
      console.error('Müşteriler alınamadı:', err);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const updateNote = async (noteId: string) => {
    if (!editNoteContent.trim()) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

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

  const deleteNote = async (noteId: string) => {
    if (!confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setNotes(notes.filter(note => note._id !== noteId));
      }
    } catch (err) {
      console.error('Not silinemedi:', err);
    }
  };

  const getCustomerName = (note: Note) => {
    return note.customerName || 'Bilinmeyen Müşteri';
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getCustomerName(note).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCustomer = !selectedCustomer || note.customerId === selectedCustomer;
    
    return matchesSearch && matchesCustomer;
  });

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Mini CRM</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/customers"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Müşteriler
                </Link>
                {user && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="text-gray-900 font-medium">{user.name || user.email}</p>
                      <p className="text-gray-500 text-xs">{user.email}</p>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tüm Notlar</h2>
              <Link
                href="/customers"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Müşterilere Dön
              </Link>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Not içeriği veya müşteri adı ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Müşteriye göre filtrele:
                </label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tüm Müşteriler</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {/* Notes List */}
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  {notes.length === 0 ? (
                    <>
                      <p className="text-lg font-medium mb-2">Henüz not yok</p>
                      <p>İlk notunuzu ekleyerek başlayın!</p>
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
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <div key={note._id} className="bg-white shadow rounded-lg p-6">
                    {editingNote === note._id ? (
                      <div>
                        <textarea
                          value={editNoteContent}
                          onChange={(e) => setEditNoteContent(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
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
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Kaydet
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-4">
                                                     <div>
                             <h3 className="text-lg font-medium text-gray-900 mb-2">
                               {getCustomerName(note)}
                             </h3>
                            <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingNote(note._id);
                                setEditNoteContent(note.content);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => deleteNote(note._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Sil
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Oluşturulma: {typeof note.createdAt === 'string' ? note.createdAt : new Date(note.createdAt).toLocaleString('tr-TR')}</span>
                          <Link
                            href={`/customers/${note.customerId}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Müşteriyi Görüntüle →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 