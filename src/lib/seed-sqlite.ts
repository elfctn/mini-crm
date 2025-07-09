import bcrypt from 'bcryptjs';
import { dbRun, dbGet } from './sqlite';

export async function seedDatabase() {
  try {
    // test kullanıcısı var mı? kontrol et
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', ['admin@minicrm.com']);
    
    if (existingUser) {
      console.log('Test kullanıcısı zaten mevcut');
      return;
    }

    // test kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userResult: any = await dbRun(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Admin User', 'admin@minicrm.com', hashedPassword]
    );

    console.log('Test kullanıcısı oluşturuldu: admin@minicrm.com');
    console.log('Seed işlemi tamamlandı!');

  } catch (error) {
    console.error('Seed işlemi başarısız:', error);
  }
}

// seed işlemi veritabanına başlangıç örnek verilerini ekleme işlemidir
// eğer bu dosya doğrudan çalıştırılırsa seed işlemi yapılacak
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Seed hatası:', error);
    process.exit(1);
  });
} 