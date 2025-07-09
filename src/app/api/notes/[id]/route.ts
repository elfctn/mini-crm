import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Note from '@/lib/models/Note';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { NoteInput } from '@/types';

// not güncelleme endpoint'i
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    const noteId = params.id;
    const body: NoteInput = await request.json();
    const { content } = body;
    if (!content) {
      return createErrorResponse('içerik gereklidir', 400);
    }
    // notun var olup olmadığını kontrol et
    const existingNote = await Note.findOne({ _id: noteId, userId: user._id });
    if (!existingNote) {
      return createErrorResponse('not bulunamadı', 404);
    }
    // notu güncelle
    await Note.updateOne(
      { _id: noteId, userId: user._id },
      { $set: { content, updatedAt: new Date() } }
    );
    // güncellenmiş notu getir
    const updatedNote = await Note.findOne({ _id: noteId, userId: user._id });
    const formattedNote = {
      _id: updatedNote._id.toString(),
      content: updatedNote.content,
      customerId: updatedNote.customerId.toString(),
      userId: updatedNote.userId.toString(),
      createdAt: updatedNote.createdAt,
      updatedAt: updatedNote.updatedAt
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
    await connectToDatabase();
    const user = await authenticateUser(request);
    const noteId = params.id;
    // notun var olup olmadığını kontrol et
    const existingNote = await Note.findOne({ _id: noteId, userId: user._id });
    if (!existingNote) {
      return createErrorResponse('not bulunamadı', 404);
    }
    // notu sil
    await Note.deleteOne({ _id: noteId, userId: user._id });
    return Response.json({
      success: true,
      message: 'not başarıyla silindi'
    });
  } catch (error) {
    console.error('not silme hatası:', error);
    return createErrorResponse('not silinemedi', 500);
  }
} 