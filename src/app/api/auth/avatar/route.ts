import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';
import { v2 as cloudinary } from 'cloudinary';

// cloudinary konfigürasyonu - environment variable'lardan alınan bilgiler
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// avatar yükleme endpoint'i - profil fotoğrafı yükler ve cloudinary'de saklar
export async function POST(request: NextRequest) {
  try {
    // mongodb bağlantısını başlat
    await connectToDatabase();

    // authorization header'dan jwt token'ı al ve doğrula
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme token\'ı gerekli' },
        { status: 401 }
      );
    }

    // bearer token'dan jwt'yi çıkar ve doğrula
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // form data'dan yüklenen dosyayı al
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    // dosya yükleme kontrolü - dosya var mı
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya yüklenmedi' },
        { status: 400 }
      );
    }

    // dosya tipi kontrolü - sadece resim dosyaları kabul et
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Sadece resim dosyaları yüklenebilir' },
        { status: 400 }
      );
    }

    // dosya boyutu kontrolü - maksimum 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Dosya boyutu 5MB\'dan küçük olmalıdır' },
        { status: 400 }
      );
    }

    // dosyayı buffer formatına çevir - cloudinary için hazırla
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // cloudinary'ye dosyayı yükle - stream ile optimize edilmiş yükleme
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'mini-crm-avatars', // özel klasör yapısı
          transformation: [
            { width: 200, height: 200, crop: 'fill' }, // boyut standardizasyonu
            { quality: 'auto' } // otomatik kalite optimizasyonu
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // kullanıcıyı veritabanında bul - token'daki userId ile
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // eski avatar'ı cloudinary'den sil - storage temizliği
    if (user.avatar) {
      try {
        const publicId = user.avatar.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`mini-crm-avatars/${publicId}`);
        }
      } catch (error) {
        console.error('eski avatar silinemedi:', error);
      }
    }

    // yeni avatar url'ini kullanıcıya kaydet ve veritabanına güncelle
    user.avatar = (result as any).secure_url;
    await user.save();

    // başarılı avatar yükleme yanıtı döndür - yeni avatar url'i ile
    return NextResponse.json({
      success: true,
      data: {
        avatar: user.avatar
      },
      message: 'Profil fotoğrafı başarıyla yüklendi'
    });

  } catch (error) {
    // hata durumunda log kaydı ve genel hata mesajı
    console.error('avatar yükleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 