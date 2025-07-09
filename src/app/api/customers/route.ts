import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { CustomerInput } from '@/types';
import mongoose from 'mongoose';

// müşteri listesi endpoint'i
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');

    // filtre objesi oluştur
    const filter: any = { userId: user._id };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (tags) {
      const tagArray = tags.split(',');
      filter.tags = { $in: tagArray };
    }

    // müşterileri sırala
    const customers = await Customer.find(filter).sort({ createdAt: -1 });
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

    return Response.json({
      success: true,
      data: formattedCustomers
    });
  } catch (error) {
    console.error('müşteri listesi hatası:', error);
    return createErrorResponse('müşteri listesi alınamadı', 500);
  }
}

// yeni müşteri ekleme endpoint'i
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    const body: CustomerInput = await request.json();
    const { name, email, phone, tags } = body;
    if (!name || !email || !phone) {
      return createErrorResponse('ad, e-posta ve telefon gereklidir', 400);
    }
    // aynı kullanıcıya ait aynı email ile müşteri var mı?
    const existingCustomer = await Customer.findOne({ email, userId: user._id });
    if (existingCustomer) {
      return createErrorResponse('bu e-posta adresi ile müşteri zaten mevcut', 400);
    }
    // yeni müşteri oluştur
    const newCustomer = await Customer.create({
      name,
      email,
      phone,
      tags: tags || [],
      userId: new mongoose.Types.ObjectId(user._id)
    });
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
    return Response.json({
      success: true,
      data: formattedCustomer,
      message: 'müşteri başarıyla eklendi'
    });
  } catch (error) {
    console.error('müşteri ekleme hatası:', error);
    return createErrorResponse('müşteri eklenemedi', 500);
  }
}