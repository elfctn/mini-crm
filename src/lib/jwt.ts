import jwt from 'jsonwebtoken';
import { User } from '@/types';

// .env da olan jwt secretı alıyorum, yoksa fallback değer kullanıyorum
const JWT_SECRET = process.env.JWT_SECRET || 'mini-crm-super-secret-jwt-key-2024-production-fallback';

console.log('JWT_SECRET mevcut:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET uzunluğu:', JWT_SECRET.length);

// bu fonksiyon verilen kullanıcı bilgileriyle bir jwt token oluşturuyor
export function generateToken(user: User): string {
  try {
    const token = jwt.sign(
      { 
        userId: user._id,     // kullanıcı idssini payloada ekliyoruz
        email: user.email,    // emaili ekliyoruz
        name: user.name       // ismi ekliyoruz
      },
      JWT_SECRET,             // şifreleme için jwt secret kullanılıyor
      { expiresIn: '7d' }     // token 7 gün geçerli ayarladım
    );
    console.log('Token oluşturuldu, uzunluk:', token.length);
    return token;
  } catch (error) {
    console.error('Token oluşturma hatası:', error);
    throw error;
  }
}

// bu fonksiyon verilen tokenı doğrular ve içeriğini döner
export function verifyToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token doğrulandı:', !!decoded);
    return decoded;
  } catch (error) {
    console.error('Token doğrulama hatası:', error);
    throw new Error('Invalid token');
  }
}

// bu fonksiyon authorization headerdan sadece token kısmını ayıklıyor
export function extractTokenFromHeader(authHeader: string): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header');
  }
  
  return authHeader.substring(7); // -Bearer - kelimesinden sonrasını alır (sadece token!!!)
}
