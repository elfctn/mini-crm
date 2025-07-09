import { NextRequest } from 'next/server';
import { dbGet, dbRun, dbAll, initDatabase } from '@/lib/sqlite';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { NoteInput } from '@/types';

// not güncelleme endpoint'i
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // veritabanını başlat
    await initDatabase();
    
    // kullanıcıyı doğrula
    const user = await authenticateUser(request);
    const noteId = params.id;

    const body: NoteInput = await request.json();
    const { content } = body;

    // doğrulama
    if (!content) {
      return createErrorResponse('içerik gereklidir', 400);
    }

    // notun var olup olmadığını kontrol et
    const existingNote: any = await dbGet(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [noteId, user._id]
    );

    if (!existingNote) {
      return createErrorResponse('not bulunamadı', 404);
    }

    // notu güncelle
    await dbRun(
      'UPDATE notes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [content, noteId, user._id]
    );

    // güncellenmiş notu getir
    const updatedNote: any = await dbGet(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [noteId, user._id]
    );

    const formattedNote = {
      _id: updatedNote.id.toString(),
      content: updatedNote.content,
      customerId: updatedNote.customer_id.toString(),
      userId: updatedNote.user_id.toString(),
      createdAt: updatedNote.created_at,
      updatedAt: updatedNote.updated_at
    };

    return Response.json({
      success: true,
      data: formattedNote,
      message: 'not başarıyla güncellendi'
    });

  } catch (error) {
    console.error('not güncelleme hatası:', error);
    return createErrorResponse('not güncellenemedi', 500);
  }
}

// not silme endpoint'i
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // veritabanını başlat
    await initDatabase();
    
    // kullanıcıyı doğrula
    const user = await authenticateUser(request);
    const noteId = params.id;

    // notun var olup olmadığını kontrol et
    const existingNote: any = await dbGet(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [noteId, user._id]
    );

    if (!existingNote) {
      return createErrorResponse('not bulunamadı', 404);
    }

    // notu sil
    await dbRun(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [noteId, user._id]
    );

    return Response.json({
      success: true,
      message: 'not başarıyla silindi'
    });

  } catch (error) {
    console.error('not silme hatası:', error);
    return createErrorResponse('not silinemedi', 500);
  }
} 