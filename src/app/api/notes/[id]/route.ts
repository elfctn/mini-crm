import { NextRequest } from 'next/server';
import { dbGet, dbRun } from '@/lib/sqlite';
import { authenticateUser, createErrorResponse } from '@/lib/auth';

// put - not güncelleme
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(request);
    const { id } = await params;

    const body = await request.json();
    const { content } = body;

    // doğrulama
    if (!content) {
      return createErrorResponse('İçerik gereklidir', 400);
    }

    if (content.trim().length === 0) {
      return createErrorResponse('Not içeriği boş olamaz', 400);
    }

    // notun var olup olmadığını ve kullanıcıya ait olup olmadığını kontrol ediyorum
    const existingNote: any = await dbGet(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [id, user._id]
    );

    if (!existingNote) {
      return createErrorResponse('Not bulunamadı', 404);
    }

    // notu güncelliyorum
    await dbRun(
      'UPDATE notes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [content.trim(), id]
    );

    //frontende gönderilecek veri
    const now = new Date();
    const updatedNote = {
      _id: id,
      content: content.trim(),
      customerId: existingNote.customer_id.toString(),
      userId: user._id,
      createdAt: existingNote.created_at,
      updatedAt: now.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
    };

    return Response.json({
      success: true,
      data: updatedNote,
      message: 'Not başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Update note error:', error);
    return createErrorResponse('Not güncellenemedi', 500);
  }
}

// delete - not silme
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateUser(request);
    const { id } = await params;

    // notun var olup olmadığını ve kullanıcıya ait olup olmadığını kontrol ediyorum
    const note: any = await dbGet(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [id, user._id]
    );

    if (!note) {
      return createErrorResponse('Not bulunamadı', 404);
    }

    // notu siliyorum     
    await dbRun('DELETE FROM notes WHERE id = ?', [id]);

    return Response.json({
      success: true,
      message: 'Not başarıyla silindi'
    });

  } catch (error) {
    console.error('Delete note error:', error);
    return createErrorResponse('Not silinemedi', 500);
  }
} 