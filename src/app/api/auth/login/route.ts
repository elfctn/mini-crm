import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateToken } from '@/lib/jwt';
import { createAuthResponse, createErrorResponse } from '@/lib/auth';
import { LoginForm } from '@/types';

// kullanıcı giriş endpoint'i
export async function POST(request: NextRequest) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();
    
    const body: LoginForm = await request.json();
    const { email, password } = body;

    // doğrulama
    if (!email || !password) {
      return createErrorResponse('e-posta ve şifre gereklidir', 400);
    }

    // kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return createErrorResponse('geçersiz e-posta veya şifre', 401);
    }

    // şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return createErrorResponse('geçersiz e-posta veya şifre', 401);
    }

    // token oluştur
    const userForToken = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    const token = generateToken(userForToken);

    return createAuthResponse(userForToken, token);

  } catch (error) {
    console.error('giriş hatası:', error);
    return createErrorResponse('giriş işlemi başarısız', 500);
  }
} 