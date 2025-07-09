import jwt from 'jsonwebtoken';
import { User } from '@/types';

// jwt secret - canlı ortamda mutlaka değiştirin
const JWT_SECRET = process.env.JWT_SECRET || 'mini-crm-super-secret-jwt-key-2024-production-fallback';

// kullanıcı bilgileriyle jwt token oluştur
export function generateToken(user: User): string {
  try {
    const token = jwt.sign(
      { 
        userId: user._id,     // kullanıcı id'si
        email: user.email,    // email adresi
        name: user.name       // kullanıcı adı
      },
      JWT_SECRET,             // şifreleme anahtarı
      { expiresIn: '7d' }     // 7 gün geçerli
    );
    return token;
  } catch (error) {
    console.error('token oluşturma hatası:', error);
    throw error;
  }
}

// token'ı doğrula ve içeriğini döndür
export function verifyToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('token doğrulama hatası:', error);
    throw new Error('geçersiz token');
  }
}

// authorization header'dan token'ı çıkar
export function extractTokenFromHeader(authHeader: string): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('geçersiz authorization header');
  }
  
  return authHeader.substring(7); // "Bearer " kısmını çıkar
}
