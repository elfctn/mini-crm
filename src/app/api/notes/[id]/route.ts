import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Note from '@/lib/models/Note';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { NoteInput } from '@/types';

// not güncelleme endpoint'i - mevcut not içeriğini günceller
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    // jwt token ile kullanıcıyı doğrula
    const user = await authenticateUser(request);
    
    // url parametresinden not id'sini al
    const noteId = params.id;
    
    // request body'den güncellenecek içeriği al
    const body: NoteInput = await request.json();
    const { content } = body;
    
    // temel validasyon - içerik kontrolü
    if (!content) {
      return createErrorResponse('içerik gereklidir', 400);
    }
    
    // notun var olup olmadığını kontrol et - kullanıcıya özel kontrol
    const existingNote = await Note.findOne({ _id: noteId, userId: user._id });
    if (!existingNote) {
      return createErrorResponse('not bulunamadı', 404);
    }
    
    // notu güncelle - içerik ve updatedAt'i güncelle
    await Note.updateOne(
      { _id: noteId, userId: user._id },
      { $set: { content, updatedAt: new Date() } }
    );
    
    // güncellenmiş notu veritabanından getir
    const updatedNote = await Note.findOne({ _id: noteId, userId: user._id });
    
    // not verilerini formatla - objectId'leri string'e çevir
    const formattedNote = {
      _id: updatedNote._id.toString(),
      content: updatedNote.content,
      customerId: updatedNote.customerId.toString(),
      userId: updatedNote.userId.toString(),
      createdAt: updatedNote.createdAt,
      updatedAt: updatedNote.updatedAt
    };
    
    // başarılı yanıt döndür - güncellenmiş not bilgileri ile
    return Response.json({
      success: true,
      data: formattedNote,
      message: 'not başarıyla güncellendi'
    });
  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('not güncelleme hatası:', error);
    return createErrorResponse('not güncellenemedi', 500);
  }
}

// not silme endpoint'i - belirtilen notu siler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    // jwt token ile kullanıcıyı doğrula
    const user = await authenticateUser(request);
    
    // url parametresinden not id'sini al
    const noteId = params.id;
    
    // notun var olup olmadığını kontrol et - kullanıcıya özel kontrol
    const existingNote = await Note.findOne({ _id: noteId, userId: user._id });
    if (!existingNote) {
      return createErrorResponse('not bulunamadı', 404);
    }
    
    // notu veritabanından sil
    await Note.deleteOne({ _id: noteId, userId: user._id });
    
    // başarılı silme yanıtı döndür
    return Response.json({
      success: true,
      message: 'not başarıyla silindi'
    });
  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('not silme hatası:', error);
    return createErrorResponse('not silinemedi', 500);
  }
} 