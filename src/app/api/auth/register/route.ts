import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbRun, dbGet } from '@/lib/sqlite';
import { generateToken } from '@/lib/jwt';
import { createAuthResponse, createErrorResponse } from '@/lib/auth';
import { UserInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: UserInput = await request.json();
    const { name, email, password } = body;

    // doğrulama
    if (!name || !email || !password) {
      return createErrorResponse('Tüm alanlar gereklidir', 400);
    }

    if (password.length < 6) {
      return createErrorResponse('Şifre en az 6 karakter olmalıdır', 400);
    }

    // kullanıcı zaten var mı?? kontrol et
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return createErrorResponse('Bu e-posta adresi zaten kullanılıyor', 400);
    }

    // şifreyi hashledik
    const hashedPassword = await bcrypt.hash(password, 10);

    // yeni kullanıcı oluştur
    const result: any = await dbRun(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const user = {
      _id: result.lastID.toString(),
      name,
      email,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // token oluştur
    const token = generateToken(user);

    return createAuthResponse(user, token);

  } catch (error) {
    console.error('Register error:', error);
    return createErrorResponse('Kayıt işlemi başarısız', 500);
  }
} 