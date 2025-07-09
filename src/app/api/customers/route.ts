import { NextRequest } from 'next/server';
import { dbGet, dbRun, dbAll, initDatabase } from '@/lib/sqlite';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { CustomerInput } from '@/types';

//  müşteri listesiyle ilgili tüm işlemleri 
// tüm müşterileri getirme- yeni müşteri oluşturma 


// get - müşteri listesi
export async function GET(request: NextRequest) {
  try {
    // veritabanını başlat
    
    // kullanıcıyı doğrula.
    const user = await authenticateUser(request);

    // urlden arama (search) ve etiketler (tags) parametrelerini al
    //  (tekrar kontrol edilecek burası)
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');

    // başlangıç sorgusu: kullanıcının tüm müşterilerini seç.
    let query = 'SELECT * FROM customers WHERE user_id = ?';
    let params: any[] = [user._id];

    // arama filtresi !!! 
    // eğer bir arama terimi varsa 
    // ismi veya epostayı içeren müşterileri sorguya ekle
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // etiket filtresi!!!!
    //  eğer etiketler varsa
    //  bu etiketlerden herhangi birini içeren müşterileri sorguya ekle.
    if (tags) {
      const tagArray = tags.split(','); // etiketleri virgülle ayırarak diziye dönüştür.
      const tagConditions = tagArray.map(() => 'tags LIKE ?').join(' OR '); // her etiket için 'tags like ?' koşulu oluştur.
      query += ` AND (${tagConditions})`;
      tagArray.forEach(tag => params.push(`%${tag}%`)); // her etiketi parametre olarak ekle.
    }

    // müşterileri oluşturulma tarihine göre azalan sırada sırala.
    query += ' ORDER BY created_at DESC';

    // veritabanından müşterileri getir.
    const customers: any = await dbAll(query, params);

    // her müşterinin etiketlerini json string'inden parse ederek uygun formata dönüştür.
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

    // başarılı yanıtı biçimlendirilmiş müşteri listesiyle birlikte döndür.
    return Response.json({
      success: true,
      data: formattedCustomers
    });

  } catch (error) {
    // herhangi bir hata oluşursa, hatayı konsola yazdır ve 500 hata mesajı döndür.
    console.error('get customers error:', error);
    return createErrorResponse('müşteri listesi alınamadı', 500);
  }
}

// post - yeni müşteri
export async function POST(request: NextRequest) {
  try {
    // veritabanını başlat
    
    // kullanıcıyı doğrula.
    const user = await authenticateUser(request);

    // istek gövdesinden (body) yeni müşteri verilerini (isim, email, telefon, etiketler) al.
    const body: CustomerInput = await request.json();
    const { name, email, phone, tags } = body;

    // doğrulama: isim, e-posta ve telefon alanlarının boş olup olmadığını kontrol et.
    if (!name || !email || !phone) {
      return createErrorResponse('ad, e-posta ve telefon gereklidir', 400);
    }

    // bu kullanıcının zaten bu e-posta adresine sahip bir müşterisi olup olmadığını kontrol et.
    const existingCustomer = await dbGet(
      'SELECT * FROM customers WHERE email = ? AND user_id = ?',
      [email, user._id]
    );

    // eğer bu e-posta ile bir müşteri zaten varsa, 400 hata mesajı döndür.
    if (existingCustomer) {
      return createErrorResponse('bu e-posta adresi ile müşteri zaten mevcut', 400);
    }

    // veritabanına yeni bir müşteri ekle etiketler bir json stringi olarak saklanır
    const result: any = await dbRun(
      'INSERT INTO customers (name, email, phone, tags, user_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, JSON.stringify(tags || []), user._id]
    );

    // oluşturulan yeni müşteri verilerini api yanıtı için biçimlendiriyorum 
    const newCustomer = {
      _id: result.lastID.toString(), // eklenen son kaydın idsini al
      name,
      email,
      phone,
      tags: tags || [],
      userId: user._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // başarılı yanıtı yeni müşteri verisi ve mesajıyla birlikte döndürecek
    return Response.json({
      success: true,
      data: newCustomer,
      message: 'müşteri başarıyla eklendi'
    });

  } catch (error) {
    // herhangi bir hata oluşursa hatayı konsola yazdır ve 500 fırlat işte üf
        console.error('create customer error:', error);
    return createErrorResponse('müşteri eklenemedi', 500);
  }
}