import { NextRequest } from 'next/server';
import { dbGet, dbRun, dbAll, initDatabase } from '@/lib/sqlite';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { CustomerInput } from '@/types';

// tek müşteri detayı endpoint'i
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // veritabanını başlat
    await initDatabase();
    
    // kullanıcıyı doğrula
    const user = await authenticateUser(request);
    const customerId = params.id;

    // müşteriyi bul
    const customer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [customerId, user._id]
    );

    if (!customer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }

    // müşteri notlarını getir
    const notes: any = await dbAll(
      'SELECT * FROM notes WHERE customer_id = ? AND user_id = ? ORDER BY created_at DESC',
      [customerId, user._id]
    );

    // yanıtı formatla
    const formattedCustomer = {
      _id: customer.id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      tags: customer.tags ? JSON.parse(customer.tags) : [],
      userId: customer.user_id.toString(),
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      notes: notes.map((note: any) => ({
        _id: note.id.toString(),
        content: note.content,
        customerId: note.customer_id.toString(),
        userId: note.user_id.toString(),
        createdAt: note.created_at,
        updatedAt: note.updated_at
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
    // veritabanını başlat
    await initDatabase();
    
    // kullanıcıyı doğrula
    const user = await authenticateUser(request);
    const customerId = params.id;

    const body: CustomerInput = await request.json();
    const { name, email, phone, tags } = body;

    // doğrulama
    if (!name || !email || !phone) {
      return createErrorResponse('ad, e-posta ve telefon gereklidir', 400);
    }

    // müşterinin var olup olmadığını kontrol et
    const existingCustomer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [customerId, user._id]
    );

    if (!existingCustomer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }

    // aynı email ile başka müşteri var mı kontrol et
    const duplicateEmail: any = await dbGet(
      'SELECT * FROM customers WHERE email = ? AND user_id = ? AND id != ?',
      [email, user._id, customerId]
    );

    if (duplicateEmail) {
      return createErrorResponse('bu e-posta adresi ile başka bir müşteri zaten mevcut', 400);
    }

    // müşteriyi güncelle
    await dbRun(
      'UPDATE customers SET name = ?, email = ?, phone = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [name, email, phone, JSON.stringify(tags || []), customerId, user._id]
    );

    // güncellenmiş müşteriyi getir
    const updatedCustomer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [customerId, user._id]
    );

    const formattedCustomer = {
      _id: updatedCustomer.id.toString(),
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      phone: updatedCustomer.phone,
      tags: updatedCustomer.tags ? JSON.parse(updatedCustomer.tags) : [],
      userId: updatedCustomer.user_id.toString(),
      createdAt: updatedCustomer.created_at,
      updatedAt: updatedCustomer.updated_at
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
    // veritabanını başlat
    await initDatabase();
    
    // kullanıcıyı doğrula
    const user = await authenticateUser(request);
    const customerId = params.id;

    // müşterinin var olup olmadığını kontrol et
    const existingCustomer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [customerId, user._id]
    );

    if (!existingCustomer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }

    // önce müşterinin notlarını sil
    await dbRun(
      'DELETE FROM notes WHERE customer_id = ? AND user_id = ?',
      [customerId, user._id]
    );

    // sonra müşteriyi sil
    await dbRun(
      'DELETE FROM customers WHERE id = ? AND user_id = ?',
      [customerId, user._id]
    );

    return Response.json({
      success: true,
      message: 'müşteri başarıyla silindi'
    });

  } catch (error) {
    console.error('müşteri silme hatası:', error);
    return createErrorResponse('müşteri silinemedi', 500);
  }
}