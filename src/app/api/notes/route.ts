import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Note from '@/lib/models/Note';
import Customer from '@/lib/models/Customer';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { NoteInput } from '@/types';
import mongoose from 'mongoose';

// tüm notlar veya müşteri bazlı notlar endpoint'i - filtreleme ile not listesi döner
export async function GET(request: NextRequest) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    // jwt token ile kullanıcıyı doğrula
    const user = await authenticateUser(request);
    
    // url parametrelerini al - müşteri bazlı filtreleme
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    
    // filtre objesi oluştur - kullanıcıya özel notlar
    let filter: any = { userId: user._id };
    
    // müşteri bazlı filtreleme - belirli müşterinin notları
    if (customerId) {
      filter.customerId = customerId;
    }
    
    // notları veritabanından çek - oluşturulma tarihine göre sırala
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    
    // notları formatla - objectId'leri string'e çevir
    const formattedNotes = notes.map((note: any) => ({
      _id: note._id.toString(),
      content: note.content,
      customerId: note.customerId.toString(),
      userId: note.userId.toString(),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    }));
    
    // başarılı yanıt döndür - formatlanmış not listesi ile
    return Response.json({
      success: true,
      data: formattedNotes
    });
  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('not listesi hatası:', error);
    return createErrorResponse('not listesi alınamadı', 500);
  }
}

// yeni not ekleme endpoint'i - müşteriye özel not oluşturur
export async function POST(request: NextRequest) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    // jwt token ile kullanıcıyı doğrula
    const user = await authenticateUser(request);
    
    // request body'den not bilgilerini al
    const body: NoteInput = await request.json();
    const { content, customerId } = body;
    
    // temel validasyon - zorunlu alanları kontrol et
    if (!content || !customerId) {
      return createErrorResponse('içerik ve müşteri id gereklidir', 400);
    }
    
    // müşterinin var olup olmadığını kontrol et - kullanıcıya özel kontrol
    const customer = await Customer.findOne({ _id: customerId, userId: user._id });
    if (!customer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }
    
    // yeni not oluştur - mongoose objectId ile bağlantılar
    const newNote = await Note.create({
      content,
      customerId: new mongoose.Types.ObjectId(customerId),
      userId: new mongoose.Types.ObjectId(user._id)
    });
    
    // not verilerini formatla - objectId'leri string'e çevir
    const formattedNote = {
      _id: newNote._id.toString(),
      content: newNote.content,
      customerId: newNote.customerId.toString(),
      userId: newNote.userId.toString(),
      createdAt: newNote.createdAt,
      updatedAt: newNote.updatedAt
    };
    
    // başarılı yanıt döndür - yeni oluşturulan not bilgileri ile
    return Response.json({
      success: true,
      data: formattedNote,
      message: 'not başarıyla eklendi'
    });
  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('not ekleme hatası:', error);
    return createErrorResponse('not eklenemedi', 500);
  }
} 