import { NextRequest } from 'next/server';
import { dbAll, dbRun, dbGet } from '@/lib/sqlite';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { NoteInput } from '@/types';

// get - not listesi (müşteriye göre!!!!)
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return createErrorResponse('Müşteri ID gereklidir', 400);
    }

    // müşterinin kullanıcıya ait olup olmadığını kontrol ediyorum
    const customer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [customerId, user._id]
    );

    if (!customer) {
      return createErrorResponse('Müşteri bulunamadı', 404);
    }

    // müşteri için notları getiriyorum
    const notes: any = await dbAll(
      'SELECT * FROM notes WHERE customer_id = ? AND user_id = ? ORDER BY created_at DESC',
      [customerId, user._id]
    );

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
    console.error('Get notes error:', error);
    return createErrorResponse('Not listesi alınamadı', 500);
  }
}

// post - yeni not
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateUser(request);

    const body: NoteInput = await request.json();
    const { content, customerId } = body;

    // doğrulama yapıyorum
    if (!content || !customerId) {
      return createErrorResponse('İçerik ve müşteri ID gereklidir', 400);
    }

    if (content.trim().length === 0) {
      return createErrorResponse('Not içeriği boş olamaz', 400);
    }

    // müşterinin kullanıcıya ait olup olmadığını kontrol ediyorum
    const customer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [customerId, user._id]
    );

    if (!customer) {
      return createErrorResponse('Müşteri bulunamadı', 404);
    }

    // yeni not oluşturuyorum   
    const result: any = await dbRun(
      'INSERT INTO notes (content, customer_id, user_id) VALUES (?, ?, ?)',
      [content.trim(), customerId, user._id]
    );

    const newNote = {
      _id: result.lastID.toString(),
      content: content.trim(),
      customerId,
      userId: user._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return Response.json({
      success: true,
      data: newNote,
      message: 'Not başarıyla eklendi'
    });

  } catch (error) {
    console.error('Create note error:', error);
    return createErrorResponse('Not eklenemedi', 500);
  }
} 