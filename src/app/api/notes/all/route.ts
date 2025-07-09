import { NextRequest } from 'next/server';
import { dbAll } from '@/lib/sqlite';
import { authenticateUser, createErrorResponse } from '@/lib/auth';

// get - kullanıcının tüm notları
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateUser(request);

    // kullanıcının tüm notlarını getir
    const notes: any = await dbAll(
      `SELECT n.*, c.name as customer_name 
       FROM notes n 
       JOIN customers c ON n.customer_id = c.id 
       WHERE n.user_id = ? 
       ORDER BY n.created_at DESC`,
      [user._id]
    );

    const formattedNotes = notes.map((note: any) => ({
      _id: note.id.toString(),
      content: note.content,
      customerId: note.customer_id.toString(),
      customerName: note.customer_name,
      userId: note.user_id.toString(),
      createdAt: new Date(note.created_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
      updatedAt: new Date(note.updated_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
    }));

    return Response.json({
      success: true,
      data: formattedNotes
    });

  } catch (error) {
    console.error('Get all notes error:', error);
    return createErrorResponse('Not listesi alınamadı', 500);
  }
} 