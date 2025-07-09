import { NextRequest } from 'next/server';
import { dbGet, dbRun } from '@/lib/sqlite';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { CustomerInput } from '@/types';

//  belirli bir müşteriyle ilgili işlemleri  yapacağım
// ---tek müşteriyi getirme- güncelleme- silme

// get - tek müşteri
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // kullanıcıyı doğrula eğer kullanıcı doğrulanamazsa hata döndürür
    const user = await authenticateUser(request);
    // urlden müşteri idsini aldım
    const { id } = await params;

    // veritabanından belirtilen idye ve kullanıcının idsine sahip müşteriyi getir
    const customer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [id, user._id]
    );

    // eğer müşteri bulunamazsa 404 nonfound mesajı döndür
    if (!customer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }

    // veritabanından gelen müşteri verisini api yanıtı için uygun formata dönüştürüyorum
    // idyi stringe çevirir etiketleri json stringinden parse eder
    const formattedCustomer = {
      _id: customer.id.toString(),
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      tags: customer.tags ? JSON.parse(customer.tags) : [],
      userId: customer.user_id.toString(),
      createdAt: customer.created_at,
      updatedAt: customer.updated_at
    };

    // başarılı yanıtı biçimlendirilmiş müşteri verisiyle birlikte döndürüyorum
    return Response.json({
      success: true,
      data: formattedCustomer
    });

  } catch (error) {
    // herhangi bir hata oluşursa hatayı konsola yazdır ve 500 hata mesajı döndür
    console.error('get customer error:', error);
    return createErrorResponse('müşteri bilgisi alınamadı', 500);
  }
}

// put - müşteri güncelleme
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // kullanıcıyı doğrula
    const user = await authenticateUser(request);
    // url'den müşteri id'sini al.
    const { id } = await params;

    // istek gövdesinden (body) müşteri verilerini (isim, email, telefon, etiketler) al.
    const body: CustomerInput = await request.json();
    const { name, email, phone, tags } = body;

    // doğrulama: isim, e-posta ve telefon alanlarının boş olup olmadığını kontrol et.
    if (!name || !email || !phone) {
      return createErrorResponse('ad, e-posta ve telefon gereklidir', 400);
    }

    // güncellenmek istenen müşterinin mevcut olup olmadığını ve kimliği doğrulanan kullanıcıya ait olup olmadığını kontrol et.
    const existingCustomer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [id, user._id]
    );

    // eğer müşteri bulunamazsa, 404 hata mesajı döndür.
    if (!existingCustomer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }

    // aynı e-posta adresinin başka bir müşteri tarafından kullanılıp kullanılmadığını kontrol et (mevcut müşteri hariç).
    const emailExists: any = await dbGet(
      'SELECT * FROM customers WHERE email = ? AND user_id = ? AND id != ?',
      [email, user._id, id]
    );

    // eğer e-posta başka bir müşteri tarafından kullanılıyorsa 400 hata mesajı döndür
    if (emailExists) {
      return createErrorResponse('bu e-posta adresi başka bir müşteri tarafından kullanılıyor', 400);
    }

    // veritabanında müşteriyi güncelle. etiketler bir json stringi olarak saklanacak
    await dbRun(
      'UPDATE customers SET name = ?, email = ?, phone = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, phone, JSON.stringify(tags || []), id]
    );

    // güncellenmiş müşteri verilerini api yanıtı için biçimlendir
    const updatedCustomer = {
      _id: id,
      name,
      email,
      phone,
      tags: tags || [],
      userId: user._id,
      createdAt: existingCustomer.created_at,
      updatedAt: new Date().toISOString()
    };

    // başarılı yanıtı güncellenmiş müşteri verisi ve mesajıyla birlikte döndür
    return Response.json({
      success: true,
      data: updatedCustomer,
      message: 'müşteri başarıyla güncellendi'
    });

  } catch (error) {
    // herhangi bir hata oluşursa, hatayı konsola yazdır ve 500 hata mesajı döndür
    console.error('update customer error:', error);
    return createErrorResponse('müşteri güncellenemedi', 500);
  }
}

// delete - müşteri silme
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // kullanıcıyı doğruladım
    const user = await authenticateUser(request);
    // urlden müşteri idsini aldım
    const { id } = await params;

    // silinmek istenen müşterinin mevcut olup olmadığını ve kimliği doğrulanan kullanıcıya ait olup olmadığını kontrol et.
    const customer: any = await dbGet(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [id, user._id]
    );

    // eğer müşteri bulunamazsa 404 hata mesajı döndürecek
    if (!customer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }

    // veritabanından müşteriyi sil
    // -- notlar gibi ilişkili veriler foreign key constraint sayesinde otomatik olarak silinecek!!!!!
    await dbRun('DELETE FROM customers WHERE id = ?', [id]);

    // başarılı yanıtı mesajla birlikte döndür
    return Response.json({
      success: true,
      message: 'müşteri başarıyla silindi'
    });

  } catch (error) {
    // herhangi bir hata oluşursa hatayı konsola yazdır ve 500 hata mesajı döndür
    console.error('delete customer error:', error);
    return createErrorResponse('müşteri silinemedi', 500);
  }
}