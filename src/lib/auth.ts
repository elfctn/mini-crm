import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { User } from '@/types';

// requeste user eklemek için özel bir interface tanımladım
export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

// bu fonksiyon request içindeki tokenı alıyor doğruluyor ve kullanıcı bilgilerini dönüyorr
export async function authenticateUser(request: NextRequest): Promise<User> {
  try {
    // authorization headerı alıyorum
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.log('Authorization header eksik');
      throw new Error('Authorization header missing');
    }

    console.log('Authorization header mevcut:', authHeader.substring(0, 20) + '...');

    // tokenı headerdan çıkarıyorum
    const token = extractTokenFromHeader(authHeader);
    console.log('Token çıkarıldı, uzunluk:', token.length);
    
    // tokenı doğrulayıp içindeki verileri alıyorum
    const decoded: any = verifyToken(token);
    console.log('Token doğrulandı, decoded:', { userId: decoded.userId, email: decoded.email });
    
    // decoded bilgileri user formatına çevirip geri dönüyorum
    const user: User = {
      _id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Kullanıcı doğrulandı:', user.name);
    return user;
  } catch (error) {
    console.error('Authentication failed:', error);
    throw new Error('Authentication failed');
  }
}

// başarılı giriş sonrası döneceğimiz json response 
export function createAuthResponse(user: User, token: string) {
  console.log('Auth response oluşturuluyor:', { userId: user._id, tokenLength: token.length });
  
  return NextResponse.json({
    success: true,
    data: {
      user,
      token
    },
    message: 'Authentication successful'
  });
}

// hata durumlarında döneceğimiz json response
export function createErrorResponse(message: string, status: number = 400) {
  console.log('Error response oluşturuluyor:', { message, status });
  
  return NextResponse.json(
    {
      success: false,
      error: message
    },
    { status }
  );
}
