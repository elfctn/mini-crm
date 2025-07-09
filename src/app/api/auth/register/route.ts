import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbGet, dbRun, dbAll, initDatabase } from '@/lib/sqlite';
import { generateToken } from '@/lib/jwt';
import { createAuthResponse, createErrorResponse } from '@/lib/auth';
import { RegisterForm } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // veritabanını başlat
    await initDatabase();
    
    const body: RegisterForm = await request.json();
    const { name, email, password } = body;

    console.log('Register denemesi:', { name, email, passwordLength: password?.length });

    // doğrulama
    if (!name || !email || !password) {
      return createErrorResponse('Ad, e-posta ve şifre gereklidir', 400);
    }

    if (password.length < 6) {
      return createErrorResponse('Şifre en az 6 karakter olmalıdır', 400);
    }

    // e-posta formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return createErrorResponse('Geçerli bir e-posta adresi giriniz', 400);
    }

    // kullanıcının zaten var olup olmadığını kontrol et
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return createErrorResponse('Bu e-posta adresi zaten kullanılıyor', 400);
    }

    // şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12);

    // yeni kullanıcıyı veritabanına ekle
    const result: any = await dbRun(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    console.log('Kullanıcı oluşturuldu:', { id: result.lastID, name, email });

    // token oluştur
    const userForToken = {
      _id: result.lastID.toString(),
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const token = generateToken(userForToken);

    console.log('Register başarılı:', { userId: result.lastID, tokenLength: token.length });

    return createAuthResponse(userForToken, token);

  } catch (error) {
    console.error('Register error:', error);
    return createErrorResponse('Kayıt işlemi başarısız', 500);
  }
} 