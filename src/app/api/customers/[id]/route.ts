import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';
import Note from '@/lib/models/Note';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { CustomerInput } from '@/types';
import mongoose from 'mongoose';

// tek müşteri detayı endpoint'i
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    const customerId = params.id;
    // müşteriyi bul
    const customer = await Customer.findOne({ _id: customerId, userId: user._id });
    if (!customer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }
    // müşteri notlarını getir
    const notes = await Note.find({ customerId: customerId, userId: user._id }).sort({ createdAt: -1 });
    // yanıtı formatla
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
    return Response.json({
      success: true,
      data: formattedCustomer
    });
  } catch (error) {
    console.error('müşteri detay hatası:', error);
    return createErrorResponse('müşteri detayı alınamadı', 500);
  }
}

// müşteri güncelleme endpoint'i
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    const customerId = params.id;
    const body: CustomerInput = await request.json();
    const { name, email, phone, tags } = body;
    if (!name || !email || !phone) {
      return createErrorResponse('ad, e-posta ve telefon gereklidir', 400);
    }
    // müşterinin var olup olmadığını kontrol et
    const existingCustomer = await Customer.findOne({ _id: customerId, userId: user._id });
    if (!existingCustomer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }
    // aynı email ile başka müşteri var mı kontrol et
    const duplicateEmail = await Customer.findOne({ email, userId: user._id, _id: { $ne: customerId } });
    if (duplicateEmail) {
      return createErrorResponse('bu e-posta adresi ile başka bir müşteri zaten mevcut', 400);
    }
    // müşteriyi güncelle
    await Customer.updateOne(
      { _id: customerId, userId: user._id },
      { $set: { name, email, phone, tags: tags || [], updatedAt: new Date() } }
    );
    // güncellenmiş müşteriyi getir
    const updatedCustomer = await Customer.findOne({ _id: customerId, userId: user._id });
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
    return Response.json({
      success: true,
      data: formattedCustomer,
      message: 'müşteri başarıyla güncellendi'
    });
  } catch (error) {
    console.error('müşteri güncelleme hatası:', error);
    return createErrorResponse('müşteri güncellenemedi', 500);
  }
}

// müşteri silme endpoint'i
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    const customerId = params.id;
    // müşterinin var olup olmadığını kontrol et
    const existingCustomer = await Customer.findOne({ _id: customerId, userId: user._id });
    if (!existingCustomer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }
    // önce müşterinin notlarını sil
    await Note.deleteMany({ customerId: customerId, userId: user._id });
    // sonra müşteriyi sil
    await Customer.deleteOne({ _id: customerId, userId: user._id });
    return Response.json({
      success: true,
      message: 'müşteri başarıyla silindi'
    });
  } catch (error) {
    console.error('müşteri silme hatası:', error);
    return createErrorResponse('müşteri silinemedi', 500);
  }
}