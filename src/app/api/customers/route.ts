import { NextRequest } from 'next/server';
import { dbGet, dbRun, dbAll, initDatabase } from '@/lib/sqlite';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { CustomerInput } from '@/types';

// müşteri listesi endpoint'i
export async function GET(request: NextRequest) {
  try {
    // veritabanını başlat
    await initDatabase();
    
    // kullanıcıyı doğrula
    const user = await authenticateUser(request);

    // url'den arama ve etiket parametrelerini al
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');

    // başlangıç sorgusu: kullanıcının tüm müşterilerini seç
    let query = 'SELECT * FROM customers WHERE user_id = ?';
    let params: any[] = [user._id];

    // arama filtresi
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // etiket filtresi
    if (tags) {
      const tagArray = tags.split(',');
      const tagConditions = tagArray.map(() => 'tags LIKE ?').join(' OR ');
      query += ` AND (${tagConditions})`;
      tagArray.forEach(tag => params.push(`%${tag}%`));
    }

    // müşterileri oluşturulma tarihine göre azalan sırada sırala
    query += ' ORDER BY created_at DESC';

    // veritabanından müşterileri getir
    const customers: any = await dbAll(query, params);

    // her müşterinin etiketlerini json string'inden parse ederek formatla
    const formattedCustomers = customers.map((customer: any) => ({
      _id: customer.id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      tags: customer.tags ? JSON.parse(customer.tags) : [],
      userId: customer.user_id.toString(),
      createdAt: customer.created_at,
      updatedAt: customer.updated_at
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
    // veritabanını başlat
    await initDatabase();
    
    // kullanıcıyı doğrula
    const user = await authenticateUser(request);

    // istek gövdesinden yeni müşteri verilerini al
    const body: CustomerInput = await request.json();
    const { name, email, phone, tags } = body;

    // doğrulama
    if (!name || !email || !phone) {
      return createErrorResponse('ad, e-posta ve telefon gereklidir', 400);
    }

    // bu kullanıcının zaten bu e-posta adresine sahip bir müşterisi olup olmadığını kontrol et
    const existingCustomer = await dbGet(
      'SELECT * FROM customers WHERE email = ? AND user_id = ?',
      [email, user._id]
    );

    if (existingCustomer) {
      return createErrorResponse('bu e-posta adresi ile müşteri zaten mevcut', 400);
    }

    // veritabanına yeni müşteri ekle
    const result: any = await dbRun(
      'INSERT INTO customers (name, email, phone, tags, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, JSON.stringify(tags || []), user._id]
    );

    // oluşturulan yeni müşteri verilerini formatla
    const newCustomer = {
      _id: result.lastID.toString(),
      name,
      email,
      phone,
      tags: tags || [],
      userId: user._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return Response.json({
      success: true,
      data: newCustomer,
      message: 'müşteri başarıyla eklendi'
    });

  } catch (error) {
    console.error('müşteri ekleme hatası:', error);
    return createErrorResponse('müşteri eklenemedi', 500);
  }
}