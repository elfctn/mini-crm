import { NextRequest } from 'next/server';
import { dbGet, dbRun, dbAll, initDatabase } from '@/lib/sqlite';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { CustomerInput } from '@/types';

// get - tek müşteri detayı
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

    console.log('Müşteri detayı isteniyor:', { userId: user._id, customerId });

    // müşteriyi bul
    const customer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [customerId, user._id]
    );

    if (!customer) {
      return createErrorResponse('Müşteri bulunamadı', 404);
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

    console.log('Müşteri detayı bulundu:', { customerId, notesCount: notes.length });

    return Response.json({
      success: true,
      data: formattedCustomer
    });

  } catch (error) {
    console.error('get customer detail error:', error);
    return createErrorResponse('Müşteri detayı alınamadı', 500);
  }
}

// put - müşteri güncelleme
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

    console.log('Müşteri güncelleniyor:', { userId: user._id, customerId });

    const body: CustomerInput = await request.json();
    const { name, email, phone, tags } = body;

    console.log('Güncelleme verileri:', { name, email, phone, tags });

    // doğrulama
    if (!name || !email || !phone) {
      return createErrorResponse('Ad, e-posta ve telefon gereklidir', 400);
    }

    // müşterinin var olup olmadığını kontrol et
    const existingCustomer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [customerId, user._id]
    );

    if (!existingCustomer) {
      return createErrorResponse('Müşteri bulunamadı', 404);
    }

    // aynı email ile başka müşteri var mı kontrol et
    const duplicateEmail: any = await dbGet(
      'SELECT * FROM customers WHERE email = ? AND user_id = ? AND id != ?',
      [email, user._id, customerId]
    );

    if (duplicateEmail) {
      return createErrorResponse('Bu e-posta adresi ile başka bir müşteri zaten mevcut', 400);
    }

    // müşteriyi güncelle
    await dbRun(
      'UPDATE customers SET name = ?, email = ?, phone = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [name, email, phone, JSON.stringify(tags || []), customerId, user._id]
    );

    console.log('Müşteri güncellendi:', { customerId, name, email });

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
      message: 'Müşteri başarıyla güncellendi'
    });

  } catch (error) {
    console.error('update customer error:', error);
    return createErrorResponse('Müşteri güncellenemedi', 500);
  }
}

// delete - müşteri silme
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

    console.log('Müşteri siliniyor:', { userId: user._id, customerId });

    // müşterinin var olup olmadığını kontrol et
    const existingCustomer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [customerId, user._id]
    );

    if (!existingCustomer) {
      return createErrorResponse('Müşteri bulunamadı', 404);
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

    console.log('Müşteri silindi:', { customerId, name: existingCustomer.name });

    return Response.json({
      success: true,
      message: 'Müşteri başarıyla silindi'
    });

  } catch (error) {
    console.error('delete customer error:', error);
    return createErrorResponse('Müşteri silinemedi', 500);
  }
}