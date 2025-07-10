import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/jwt';
import { v2 as cloudinary } from 'cloudinary';

// cloudinary konfigürasyonu
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // veritabanına bağlan
    await connectToDatabase();

    // token'ı doğrula
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Yetkilendirme token\'ı gerekli' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    // form data'yı al
    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Dosya yüklenmedi' },
        { status: 400 }
      );
    }

    // dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Sadece resim dosyaları yüklenebilir' },
        { status: 400 }
      );
    }

    // dosya boyutunu kontrol et (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Dosya boyutu 5MB\'dan küçük olmalıdır' },
        { status: 400 }
      );
    }

    // dosyayı buffer'a çevir
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // cloudinary'ye yükle
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'mini-crm-avatars',
          transformation: [
            { width: 200, height: 200, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // kullanıcıyı bul ve avatar'ı güncelle
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // eski avatar'ı sil (varsa)
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

    // yeni avatar'ı kaydet
    user.avatar = (result as any).secure_url;
    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        avatar: user.avatar
      },
      message: 'Profil fotoğrafı başarıyla yüklendi'
    });

  } catch (error) {
    console.error('avatar yükleme hatası:', error);
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 