import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbGet, dbRun, dbAll, initDatabase } from '@/lib/sqlite';
import { generateToken } from '@/lib/jwt';
import { createAuthResponse, createErrorResponse } from '@/lib/auth';
import { LoginForm } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // veritabanını başlat
    
    const body: LoginForm = await request.json();
    const { email, password } = body;

    // doğrulama
    if (!email || !password) {
      return createErrorResponse('E-posta ve şifre gereklidir', 400);
    }

    // kullanıcıyı bul
    const user: any = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return createErrorResponse('Geçersiz e-posta veya şifre', 401);
    }

    // şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return createErrorResponse('Geçersiz e-posta veya şifre', 401);
    }

    // token oluştur
    const userForToken = {
      _id: user.id.toString(),
      email: user.email,
      name: user.name,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at)
    };
    const token = generateToken(userForToken);

    return createAuthResponse(userForToken, token);

  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Giriş işlemi başarısız', 500);
  }
} 