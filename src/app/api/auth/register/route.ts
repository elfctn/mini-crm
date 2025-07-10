import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/jwt';
import { createAuthResponse, createErrorResponse } from '@/lib/auth';
import { RegisterForm } from '@/types';

// kullanıcı kayıt endpoint'i
export async function POST(request: NextRequest) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    const body: RegisterForm = await request.json();
    const { name, email, password } = body;

    // doğrulama
    if (!name || !email || !password) {
      return createErrorResponse('ad, e-posta ve şifre gereklidir', 400);
    }

    if (password.length < 6) {
      return createErrorResponse('şifre en az 6 karakter olmalıdır', 400);
    }

    // e-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse('geçerli bir e-posta adresi giriniz', 400);
    }

    // kullanıcının zaten var olup olmadığını kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return createErrorResponse('bu e-posta adresi zaten kullanılıyor', 400);
    }

    // şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12);

    // yeni kullanıcıyı oluştur
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // token oluştur
    const userForToken = {
      _id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };
    const token = generateToken(userForToken);

    return createAuthResponse(userForToken, token);

  } catch (error) {
    console.error('kayıt hatası:', error);
    return createErrorResponse('kayıt işlemi başarısız', 500);
  }
} 