import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { User } from '@/types';

// kullanıcı bilgilerini içeren request interface'i
export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

// request'teki token'ı doğrula ve kullanıcı bilgilerini döndür
export async function authenticateUser(request: NextRequest): Promise<User> {
  try {
    // authorization header'ı al
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      throw new Error('authorization header eksik');
    }

    // token'ı header'dan çıkar
    const token = extractTokenFromHeader(authHeader);
    
    // token'ı doğrula ve içindeki verileri al
    const decoded: any = verifyToken(token);
    
    // decoded bilgileri user formatına çevir
    const user: User = {
      _id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return user;
  } catch (error) {
    console.error('kullanıcı doğrulama hatası:', error);
    throw new Error('kimlik doğrulama başarısız');
  }
}

// başarılı giriş sonrası json response oluştur
export function createAuthResponse(user: User, token: string) {
  return NextResponse.json({
    success: true,
    data: {
      user,
      token
    },
    message: 'giriş başarılı'
  });
}

// hata durumlarında json response oluştur
export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message
    },
    { status }
  );
}
