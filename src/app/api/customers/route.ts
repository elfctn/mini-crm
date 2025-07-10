import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { CustomerInput } from '@/types';
import mongoose from 'mongoose';

// müşteri listesi endpoint'i - arama ve filtreleme ile müşteri listesi döner
export async function GET(request: NextRequest) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    // jwt token ile kullanıcıyı doğrula
    const user = await authenticateUser(request);
    
    // url parametrelerini al - arama ve etiket filtreleri
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');

    // filtre objesi oluştur - kullanıcıya özel müşteriler
    const filter: any = { userId: user._id };
    
    // arama filtresi - isim ve email'de case-insensitive arama
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // etiket filtresi - virgülle ayrılmış etiketler
    if (tags) {
      const tagArray = tags.split(',');
      filter.tags = { $in: tagArray };
    }

    // müşterileri veritabanından çek - oluşturulma tarihine göre sırala
    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    
    // müşteri verilerini formatla - objectId'leri string'e çevir
    const formattedCustomers = customers.map((customer: any) => ({
      _id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      tags: customer.tags || [],
      userId: customer.userId.toString(),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }));

    // başarılı yanıt döndür - formatlanmış müşteri listesi ile
    return Response.json({
      success: true,
      data: formattedCustomers
    });
  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('müşteri listesi hatası:', error);
    return createErrorResponse('müşteri listesi alınamadı', 500);
  }
}

// yeni müşteri ekleme endpoint'i - kullanıcıya özel müşteri oluşturur
export async function POST(request: NextRequest) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    // jwt token ile kullanıcıyı doğrula
    const user = await authenticateUser(request);
    
    // request body'den müşteri bilgilerini al
    const body: CustomerInput = await request.json();
    const { name, email, phone, tags } = body;
    
    // temel validasyon - zorunlu alanları kontrol et
    if (!name || !email || !phone) {
      return createErrorResponse('ad, e-posta ve telefon gereklidir', 400);
    }
    
    // duplicate kontrolü - aynı kullanıcıya ait aynı email ile müşteri var mı
    const existingCustomer = await Customer.findOne({ email, userId: user._id });
    if (existingCustomer) {
      return createErrorResponse('bu e-posta adresi ile müşteri zaten mevcut', 400);
    }
    
    // yeni müşteri oluştur - mongoose objectId ile kullanıcı bağlantısı
    const newCustomer = await Customer.create({
      name,
      email,
      phone,
      tags: tags || [],
      userId: new mongoose.Types.ObjectId(user._id)
    });
    
    // müşteri verilerini formatla - objectId'leri string'e çevir
    const formattedCustomer = {
      _id: newCustomer._id.toString(),
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      tags: newCustomer.tags || [],
      userId: newCustomer.userId.toString(),
      createdAt: newCustomer.createdAt,
      updatedAt: newCustomer.updatedAt
    };
    
    // başarılı yanıt döndür - yeni oluşturulan müşteri bilgileri ile
    return Response.json({
      success: true,
      data: formattedCustomer,
      message: 'müşteri başarıyla eklendi'
    });
  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('müşteri ekleme hatası:', error);
    return createErrorResponse('müşteri eklenemedi', 500);
  }
}