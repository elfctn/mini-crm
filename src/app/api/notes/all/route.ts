import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Note from '@/lib/models/Note';
import Customer from '@/lib/models/Customer';
import { authenticateUser, createErrorResponse } from '@/lib/auth';

// tüm notlar endpoint'i - kullanıcının tüm notlarını müşteri adları ile döner
export async function GET(request: NextRequest) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    // jwt token ile kullanıcıyı doğrula
    const user = await authenticateUser(request);
    
    // kullanıcının tüm notlarını getir - oluşturulma tarihine göre sırala
    const notes = await Note.find({ userId: user._id }).sort({ createdAt: -1 });
    
    // müşteri adlarını topluca çekmek için id'leri topla - performans optimizasyonu
    const customerIds = notes.map((note: any) => note.customerId);
    const customers = await Customer.find({ _id: { $in: customerIds } });
    
    // müşteri id-name mapping oluştur - hızlı erişim için
    const customerMap = new Map(customers.map((c: any) => [c._id.toString(), c.name]));
    
    // notları formatla - müşteri adları ve türkçe tarih formatı ile
    const formattedNotes = notes.map((note: any) => ({
      _id: note._id.toString(),
      content: note.content,
      customerId: note.customerId.toString(),
      customerName: customerMap.get(note.customerId.toString()) || '',
      userId: note.userId.toString(),
      createdAt: note.createdAt.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
      updatedAt: note.updatedAt.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
    }));
    
    // başarılı yanıt döndür - formatlanmış not listesi ile
    return Response.json({
      success: true,
      data: formattedNotes
    });
  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('Get all notes error:', error);
    return createErrorResponse('Not listesi alınamadı', 500);
  }
} 