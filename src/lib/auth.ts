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
      throw new Error('Authorization header missing'); // header yoksa hata döner
    }

    // tokenı headerdan çıkarıyorum
    const token = extractTokenFromHeader(authHeader);
    // tokenı doğrulayıp içindeki verileri alıyorum
    const decoded: any = verifyToken(token);
    
    // decoded bilgileri user formatına çevirip geri dönüyorum
    return {
      _id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      createdAt: new Date(),     // sahte tarih -veritabanından gelmediği için!!-
      updatedAt: new Date()
    };
  } catch (error) {
    throw new Error('Authentication failed');  // herhangi bir hata durumunda genel hata mesajı
  }
}

// başarılı giriş sonrası döneceğimiz json response 
export function createAuthResponse(user: User, token: string) {
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
  return NextResponse.json(
    {
      success: false,
      error: message
    },
    { status }
  );
}
