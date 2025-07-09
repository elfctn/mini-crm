import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbGet, dbRun, dbAll, initDatabase } from '@/lib/sqlite';
import { generateToken } from '@/lib/jwt';
import { createAuthResponse, createErrorResponse } from '@/lib/auth';
import { RegisterForm } from '@/types';

// kullanıcı kayıt endpoint'i
export async function POST(request: NextRequest) {
  try {
    // veritabanını başlat
    await initDatabase();
    
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
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return createErrorResponse('bu e-posta adresi zaten kullanılıyor', 400);
    }

    // şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12);

    // yeni kullanıcıyı veritabanına ekle
    const result: any = await dbRun(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    // token oluştur
    const userForToken = {
      _id: result.lastID.toString(),
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const token = generateToken(userForToken);

    return createAuthResponse(userForToken, token);

  } catch (error) {
    console.error('kayıt hatası:', error);
    return createErrorResponse('kayıt işlemi başarısız', 500);
  }
} 