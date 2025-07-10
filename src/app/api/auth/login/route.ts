import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/jwt';
import { createAuthResponse, createErrorResponse } from '@/lib/auth';
import { LoginForm } from '@/types';

// kullanıcı giriş endpoint'i - email ve şifre ile authentication yapar
export async function POST(request: NextRequest) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    // request body'den giriş bilgilerini al
    const body: LoginForm = await request.json();
    const { email, password } = body;

    // temel validasyon - email ve şifre kontrolü
    if (!email || !password) {
      return createErrorResponse('e-posta ve şifre gereklidir', 400);
    }

    // kullanıcıyı email ile veritabanında ara
    const user = await User.findOne({ email });
    if (!user) {
      return createErrorResponse('geçersiz e-posta veya şifre', 401);
    }

    // şifre doğrulaması - bcrypt ile hash karşılaştırması
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return createErrorResponse('geçersiz e-posta veya şifre', 401);
    }

    // jwt token için kullanıcı bilgilerini hazırla - şifre hariç tüm bilgiler
    const userForToken = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    // jwt token oluştur - kullanıcı bilgileri ile
    const token = generateToken(userForToken);

    // başarılı giriş yanıtı döndür - kullanıcı bilgileri ve token ile
    return createAuthResponse(userForToken, token);

  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('giriş hatası:', error);
    return createErrorResponse('giriş işlemi başarısız', 500);
  }
} 