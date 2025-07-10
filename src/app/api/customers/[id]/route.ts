import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';
import Note from '@/lib/models/Note';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { CustomerInput } from '@/types';
import mongoose from 'mongoose';

// tek müşteri detayı endpoint'i - müşteri bilgileri ve notlarını döner
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    // jwt token ile kullanıcıyı doğrula
    const user = await authenticateUser(request);
    
    // url parametresinden müşteri id'sini al
    const customerId = params.id;
    
    // müşteriyi veritabanında bul - kullanıcıya özel kontrol
    const customer = await Customer.findOne({ _id: customerId, userId: user._id });
    if (!customer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }
    
    // müşteri notlarını getir - oluşturulma tarihine göre sırala
    const notes = await Note.find({ customerId: customerId, userId: user._id }).sort({ createdAt: -1 });
    
    // yanıtı formatla - müşteri bilgileri ve notları ile
    const formattedCustomer = {
      _id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      tags: customer.tags || [],
      userId: customer.userId.toString(),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      notes: notes.map((note: any) => ({
        _id: note._id.toString(),
        content: note.content,
        customerId: note.customerId.toString(),
        userId: note.userId.toString(),
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }))
    };
    
    // başarılı yanıt döndür - formatlanmış müşteri detayları ile
    return Response.json({
      success: true,
      data: formattedCustomer
    });
  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('müşteri detay hatası:', error);
    return createErrorResponse('müşteri detayı alınamadı', 500);
  }
}

// müşteri güncelleme endpoint'i - mevcut müşteri bilgilerini günceller
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    // jwt token ile kullanıcıyı doğrula
    const user = await authenticateUser(request);
    
    // url parametresinden müşteri id'sini al
    const customerId = params.id;
    
    // request body'den güncellenecek bilgileri al
    const body: CustomerInput = await request.json();
    const { name, email, phone, tags } = body;
    
    // temel validasyon - zorunlu alanları kontrol et
    if (!name || !email || !phone) {
      return createErrorResponse('ad, e-posta ve telefon gereklidir', 400);
    }
    
    // müşterinin var olup olmadığını kontrol et - kullanıcıya özel kontrol
    const existingCustomer = await Customer.findOne({ _id: customerId, userId: user._id });
    if (!existingCustomer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }
    
    // duplicate email kontrolü - başka müşteride aynı email var mı
    const duplicateEmail = await Customer.findOne({ email, userId: user._id, _id: { $ne: customerId } });
    if (duplicateEmail) {
      return createErrorResponse('bu e-posta adresi ile başka bir müşteri zaten mevcut', 400);
    }
    
    // müşteriyi güncelle - tüm alanları ve updatedAt'i güncelle
    await Customer.updateOne(
      { _id: customerId, userId: user._id },
      { $set: { name, email, phone, tags: tags || [], updatedAt: new Date() } }
    );
    
    // güncellenmiş müşteriyi veritabanından getir
    const updatedCustomer = await Customer.findOne({ _id: customerId, userId: user._id });
    
    // müşteri verilerini formatla - objectId'leri string'e çevir
    const formattedCustomer = {
      _id: updatedCustomer._id.toString(),
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      phone: updatedCustomer.phone,
      tags: updatedCustomer.tags || [],
      userId: updatedCustomer.userId.toString(),
      createdAt: updatedCustomer.createdAt,
      updatedAt: updatedCustomer.updatedAt
    };
    
    // başarılı yanıt döndür - güncellenmiş müşteri bilgileri ile
    return Response.json({
      success: true,
      data: formattedCustomer,
      message: 'müşteri başarıyla güncellendi'
    });
  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('müşteri güncelleme hatası:', error);
    return createErrorResponse('müşteri güncellenemedi', 500);
  }
}

// müşteri silme endpoint'i - müşteri ve tüm notlarını siler
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    // jwt token ile kullanıcıyı doğrula
    const user = await authenticateUser(request);
    
    // url parametresinden müşteri id'sini al
    const customerId = params.id;
    
    // müşterinin var olup olmadığını kontrol et - kullanıcıya özel kontrol
    const existingCustomer = await Customer.findOne({ _id: customerId, userId: user._id });
    if (!existingCustomer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }
    
    // önce müşterinin tüm notlarını sil - cascade delete
    await Note.deleteMany({ customerId: customerId, userId: user._id });
    
    // sonra müşteriyi sil
    await Customer.deleteOne({ _id: customerId, userId: user._id });
    
    // başarılı silme yanıtı döndür
    return Response.json({
      success: true,
      message: 'müşteri başarıyla silindi'
    });
  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('müşteri silme hatası:', error);
    return createErrorResponse('müşteri silinemedi', 500);
  }
}