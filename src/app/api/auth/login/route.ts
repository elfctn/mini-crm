import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbGet, dbRun, dbAll, initDatabase } from '@/lib/sqlite';
import { generateToken } from '@/lib/jwt';
import { createAuthResponse, createErrorResponse } from '@/lib/auth';
import { LoginForm } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // veritabanını başlat
    await initDatabase();
    
    const body: LoginForm = await request.json();
    const { email, password } = body;

    console.log('Login denemesi:', { email, passwordLength: password?.length });

    // doğrulama
    if (!email || !password) {
      return createErrorResponse('E-posta ve şifre gereklidir', 400);
    }

    // kullanıcıyı bul
    const user: any = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      console.log('Kullanıcı bulunamadı:', email);
      return createErrorResponse('Geçersiz e-posta veya şifre', 401);
    }

    console.log('Kullanıcı bulundu:', { id: user.id, name: user.name });

    // şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Şifre yanlış:', email);
      return createErrorResponse('Geçersiz e-posta veya şifre', 401);
    }

    console.log('Şifre doğru, token oluşturuluyor...');

    // token oluştur
    const userForToken = {
      _id: user.id.toString(),
      email: user.email,
      name: user.name,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at)
    };
    const token = generateToken(userForToken);

    console.log('Login başarılı:', { userId: user.id, tokenLength: token.length });

    return createAuthResponse(userForToken, token);

  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Giriş işlemi başarısız', 500);
  }
} 