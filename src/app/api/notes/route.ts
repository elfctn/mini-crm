import { NextRequest } from 'next/server';
import { dbGet, dbRun, dbAll, initDatabase } from '@/lib/sqlite';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { NoteInput } from '@/types';

// get - tüm notlar
export async function GET(request: NextRequest) {
  try {
    // veritabanını başlat
    await initDatabase();
    
    // kullanıcıyı doğrula
    const user = await authenticateUser(request);

    console.log('Not listesi isteniyor:', { userId: user._id });

    // kullanıcının tüm notlarını getir
    const notes: any = await dbAll(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
      [user._id]
    );

    console.log('Bulunan not sayısı:', notes.length);

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
    console.error('get notes error:', error);
    return createErrorResponse('Not listesi alınamadı', 500);
  }
}

// post - yeni not
export async function POST(request: NextRequest) {
  try {
    // veritabanını başlat
    await initDatabase();
    
    // kullanıcıyı doğrula
    const user = await authenticateUser(request);

    console.log('Yeni not ekleniyor:', { userId: user._id });

    const body: NoteInput = await request.json();
    const { content, customerId } = body;

    console.log('Not verileri:', { content, customerId });

    // doğrulama
    if (!content || !customerId) {
      return createErrorResponse('İçerik ve müşteri ID gereklidir', 400);
    }

    // müşterinin var olup olmadığını kontrol et
    const customer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [customerId, user._id]
    );

    if (!customer) {
      return createErrorResponse('Müşteri bulunamadı', 404);
    }

    // yeni not ekle
    const result: any = await dbRun(
      'INSERT INTO notes (content, customer_id, user_id) VALUES (?, ?, ?)',
      [content, customerId, user._id]
    );

    console.log('Not eklendi:', { id: result.lastID, customerId });

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
      message: 'Not başarıyla eklendi'
    });

  } catch (error) {
    console.error('create note error:', error);
    return createErrorResponse('Not eklenemedi', 500);
  }
} 