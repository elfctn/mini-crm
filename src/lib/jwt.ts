import jwt from 'jsonwebtoken';
import { User } from '@/types';



// .env da olan jwt secretı alıyorum
const JWT_SECRET = process.env.JWT_SECRET!;

// eğer secret tanımlı değilse uygulamayı durduruyorum
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

// bu fonksiyon verilen kullanıcı bilgileriyle bir jwt token oluşturuyor
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      userId: user._id,     // kullanıcı idssini payloada ekliyoruz
      email: user.email,    // emaili ekliyoruz
      name: user.name       // ismi ekliyoruz
    },
    JWT_SECRET,             // şifreleme için jwt secret kullanılıyor
    { expiresIn: '7d' }     // token 7 gün geçerli ayarladım
  );
}

// bu fonksiyon verilen tokenı doğrular ve içeriğini döner
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET); // token geçerliyse decode edilmiş veriyi döner
  } catch (error) {
    throw new Error('Invalid token');    // geçersizse hata fırlatır
  }
}

// bu fonksiyon authorization headerdan sadece token kısmını ayıklıyor
export function extractTokenFromHeader(authHeader: string): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Invalid authorization header');  // format uygun değilse hata verir
  }
  
  return authHeader.substring(7); // -Bearer - kelimesinden sonrasını alır (sadece token!!!)
}
