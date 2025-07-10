import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

// şifre değiştirme endpoint'i - mevcut şifre doğrulaması ile yeni şifre belirler
export async function PUT(request: NextRequest) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();

    // authorization header'dan jwt token'ı al ve doğrula
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme token\'ı gerekli' },
        { status: 401 }
      );
    }

    // bearer token'dan jwt'yi çıkar ve doğrula
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // request body'den şifre bilgilerini al
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // temel validasyon - mevcut ve yeni şifre kontrolü
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Mevcut şifre ve yeni şifre zorunludur' },
        { status: 400 }
      );
    }

    // yeni şifre güvenlik kontrolü - minimum 6 karakter
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Yeni şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // kullanıcıyı veritabanında bul - token'daki userId ile
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // mevcut şifre doğrulaması - bcrypt ile hash karşılaştırması
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Mevcut şifre yanlış' },
        { status: 400 }
      );
    }

    // yeni şifreyi güvenli şekilde hashle - bcrypt ile 12 salt round
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // kullanıcının şifresini güncelle ve veritabanına kaydet
    user.password = hashedNewPassword;
    await user.save();

    // başarılı şifre değiştirme yanıtı döndür
    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });

  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('şifre değiştirme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 