import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';

// profil güncelleme endpointi - kullanıcı bilgilerini günceller
export async function PUT(request: NextRequest) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();

    // authorization header'dan jwt tokenı al ve doğrula
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme token\'ı gerekli' },
        { status: 401 }
      );
    }

    // bearer token dan jwt yi çıkar ve doğrula
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // request body den güncellenecek bilgileri al
    const body = await request.json();
    const { name, email, phone } = body;

    // temel validasyon - ad ve email zorunlu
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Ad ve e-posta zorunludur' },
        { status: 400 }
      );
    }

    // email formatını kontrol et - regex ile geçerli format doğrulaması
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz e-posta formatı' },
        { status: 400 }
      );
    }

    // kullanıcıyı veritabanında bul - tokendaki userId ile
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // email değişikliği varsa duplicate kontrolü yap - başka kullanıcıda aynı email var mı
    if (email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: decoded.userId } });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }

    // kullanıcı bilgilerini güncelle - name, email ve phone
    user.name = name;
    user.email = email;
    user.phone = phone || '';

    // güncellenmiş bilgileri veritabanına kaydet
    await user.save();

    // güncellenmiş kullanıcı bilgilerini hazırla - şifre hariç tüm bilgiler
    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // başarılı güncelleme yanıtı döndür - güncellenmiş kullanıcı bilgileri ile
    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profil başarıyla güncellendi'
    });

  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('profil güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 