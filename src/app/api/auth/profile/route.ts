import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';

export async function PUT(request: NextRequest) {
  try {
    // veritabanına bağlan
    await connectToDatabase();

    // token'ı doğrula
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme token\'ı gerekli' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // request body'yi al
    const body = await request.json();
    const { name, email, phone } = body;

    // validasyon
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Ad ve e-posta zorunludur' },
        { status: 400 }
      );
    }

    // email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz e-posta formatı' },
        { status: 400 }
      );
    }

    // kullanıcıyı bul
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // email değişikliği varsa, yeni email'in başka kullanıcıda olup olmadığını kontrol et
    if (email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: decoded.userId } });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 400 }
        );
      }
    }

    // kullanıcıyı güncelle
    user.name = name;
    user.email = email;
    user.phone = phone || '';

    await user.save();

    // güncellenmiş kullanıcı bilgilerini döndür (şifre hariç)
    const updatedUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Profil başarıyla güncellendi'
    });

  } catch (error) {
    console.error('profil güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 