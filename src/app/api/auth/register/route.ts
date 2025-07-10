import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/jwt';
import { createAuthResponse, createErrorResponse } from '@/lib/auth';
import { RegisterForm } from '@/types';

// kullanıcı kayıt endpoint'i - yeni kullanıcı oluşturur ve jwt token döner
export async function POST(request: NextRequest) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    // request body'den kullanıcı bilgilerini al
    const body: RegisterForm = await request.json();
    const { name, email, password } = body;

    // temel validasyon - zorunlu alanları kontrol et
    if (!name || !email || !password) {
      return createErrorResponse('ad, e-posta ve şifre gereklidir', 400);
    }

    // şifre güvenlik kontrolü - minimum 6 karakter
    if (password.length < 6) {
      return createErrorResponse('şifre en az 6 karakter olmalıdır', 400);
    }

    // e-posta formatını kontrol et - regex ile geçerli format doğrulaması
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse('geçerli bir e-posta adresi giriniz', 400);
    }

    // kullanıcının zaten var olup olmadığını kontrol et - duplicate email önleme
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return createErrorResponse('bu e-posta adresi zaten kullanılıyor', 400);
    }

    // şifreyi güvenli şekilde hashle - bcrypt ile 12 salt round
    const hashedPassword = await bcrypt.hash(password, 12);

    // yeni kullanıcıyı veritabanında oluştur
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // jwt token için kullanıcı bilgilerini hazırla - şifre hariç tüm bilgiler
    const userForToken = {
      _id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };
    
    // jwt token oluştur - kullanıcı bilgileri ile
    const token = generateToken(userForToken);

    // başarılı kayıt yanıtı döndür - kullanıcı bilgileri ve token ile
    return createAuthResponse(userForToken, token);

  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('kayıt hatası:', error);
    return createErrorResponse('kayıt işlemi başarısız', 500);
  }
} 