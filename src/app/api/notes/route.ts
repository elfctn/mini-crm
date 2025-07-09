import { NextRequest } from 'next/server';
import { dbGet, dbRun, dbAll, initDatabase } from '@/lib/sqlite';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { NoteInput } from '@/types';

// tüm notlar endpoint'i
export async function GET(request: NextRequest) {
  try {
    // veritabanını başlat
    await initDatabase();
    
    // kullanıcıyı doğrula
    const user = await authenticateUser(request);

    // kullanıcının tüm notlarını getir
    const notes: any = await dbAll(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
      [user._id]
    );

    // notları formatla
    const formattedNotes = notes.map((note: any) => ({
      _id: note.id.toString(),
      content: note.content,
      customerId: note.customer_id.toString(),
      userId: note.user_id.toString(),
      createdAt: note.created_at,
      updatedAt: note.updated_at
    }));

    return Response.json({
      success: true,
      data: formattedNotes
    });

  } catch (error) {
    console.error('not listesi hatası:', error);
    return createErrorResponse('not listesi alınamadı', 500);
  }
}

// yeni not ekleme endpoint'i
export async function POST(request: NextRequest) {
  try {
    // veritabanını başlat
    await initDatabase();
    
    // kullanıcıyı doğrula
    const user = await authenticateUser(request);

    const body: NoteInput = await request.json();
    const { content, customerId } = body;

    // doğrulama
    if (!content || !customerId) {
      return createErrorResponse('içerik ve müşteri id gereklidir', 400);
    }

    // müşterinin var olup olmadığını kontrol et
    const customer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [customerId, user._id]
    );

    if (!customer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }

    // yeni not ekle
    const result: any = await dbRun(
      'INSERT INTO notes (content, customer_id, user_id) VALUES (?, ?, ?)',
      [content, customerId, user._id]
    );

    // yeni notu getir
    const newNote: any = await dbGet(
      'SELECT * FROM notes WHERE id = ?',
      [result.lastID]
    );

    const formattedNote = {
      _id: newNote.id.toString(),
      content: newNote.content,
      customerId: newNote.customer_id.toString(),
      userId: newNote.user_id.toString(),
      createdAt: newNote.created_at,
      updatedAt: newNote.updated_at
    };

    return Response.json({
      success: true,
      data: formattedNote,
      message: 'not başarıyla eklendi'
    });

  } catch (error) {
    console.error('not ekleme hatası:', error);
    return createErrorResponse('not eklenemedi', 500);
  }
} 