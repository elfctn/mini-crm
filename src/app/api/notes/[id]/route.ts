import { NextRequest } from 'next/server';
import { dbGet, dbRun, dbAll, initDatabase } from '@/lib/sqlite';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { NoteInput } from '@/types';

// put - not güncelleme
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

    console.log('Not güncelleniyor:', { userId: user._id, noteId });

    const body: NoteInput = await request.json();
    const { content } = body;

    console.log('Güncelleme verileri:', { content });

    // doğrulama
    if (!content) {
      return createErrorResponse('İçerik gereklidir', 400);
    }

    // notun var olup olmadığını kontrol et
    const existingNote: any = await dbGet(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [noteId, user._id]
    );

    if (!existingNote) {
      return createErrorResponse('Not bulunamadı', 404);
    }

    // notu güncelle
    await dbRun(
      'UPDATE notes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [content, noteId, user._id]
    );

    console.log('Not güncellendi:', { noteId });

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
      message: 'Not başarıyla güncellendi'
    });

  } catch (error) {
    console.error('update note error:', error);
    return createErrorResponse('Not güncellenemedi', 500);
  }
}

// delete - not silme
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

    console.log('Not siliniyor:', { userId: user._id, noteId });

    // notun var olup olmadığını kontrol et
    const existingNote: any = await dbGet(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [noteId, user._id]
    );

    if (!existingNote) {
      return createErrorResponse('Not bulunamadı', 404);
    }

    // notu sil
    await dbRun(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [noteId, user._id]
    );

    console.log('Not silindi:', { noteId });

    return Response.json({
      success: true,
      message: 'Not başarıyla silindi'
    });

  } catch (error) {
    console.error('delete note error:', error);
    return createErrorResponse('Not silinemedi', 500);
  }
} 