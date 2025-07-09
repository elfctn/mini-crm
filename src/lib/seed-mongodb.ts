import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectToDatabase, disconnectFromDatabase } from './mongodb';
import User from './models/User';

export async function seedDatabase() {
  try {
    await connectToDatabase();

    // admin kullanıcısı zaten var mı kontrol et
    const existingUser = await User.findOne({ email: 'admin@minicrm.com' });
    if (existingUser) {
      console.log('admin kullanıcısı zaten mevcut');
      return;
    }

    // admin kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await User.create({
      name: 'Admin Kullanıcı',
      email: 'admin@minicrm.com',
      password: hashedPassword
    });

    console.log('admin kullanıcısı oluşturuldu');
  } catch (error) {
    console.error('seed işlemi hatası:', error);
    throw error;
  } finally {
    await disconnectFromDatabase();
  }
}

// script olarak çalıştırılırsa
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('seed işlemi başarıyla tamamlandı');
      process.exit(0);
    })
    .catch((error) => {
      console.error('seed işlemi başarısız:', error);
      process.exit(1);
    });
} 