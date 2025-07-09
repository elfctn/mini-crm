import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectToDatabase, disconnectFromDatabase } from './mongodb';
import User from './models/User';
import Customer from './models/Customer';
import Note from './models/Note';

export async function seedDatabase() {
  try {
    await connectToDatabase();

    // kullanıcıları kontrol et
    const existingUser = await User.findOne({ email: 'admin@minicrm.com' });
    
    if (existingUser) {
      console.log('seed data zaten mevcut');
      return;
    }

    // admin kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'Admin Kullanıcı',
      email: 'admin@minicrm.com',
      password: hashedPassword
    });

    console.log('admin kullanıcısı oluşturuldu:', adminUser.email);

    // örnek müşteriler oluştur
    const customers = await Customer.create([
      {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '0532 123 45 67',
        tags: ['potansiyel', 'kurumsal'],
        userId: adminUser._id
      },
      {
        name: 'Ayşe Demir',
        email: 'ayse@example.com',
        phone: '0533 987 65 43',
        tags: ['mevcut', 'bireysel'],
        userId: adminUser._id
      },
      {
        name: 'Mehmet Kaya',
        email: 'mehmet@example.com',
        phone: '0534 555 44 33',
        tags: ['potansiyel'],
        userId: adminUser._id
      }
    ]);

    console.log(`${customers.length} müşteri oluşturuldu`);

    // örnek notlar oluştur
    const notes = await Note.create([
      {
        content: 'İlk görüşme yapıldı, proje detayları konuşuldu.',
        customerId: customers[0]._id,
        userId: adminUser._id
      },
      {
        content: 'Fiyat teklifi gönderildi, geri dönüş bekleniyor.',
        customerId: customers[0]._id,
        userId: adminUser._id
      },
      {
        content: 'Mevcut müşteri, yeni proje için görüşme talep etti.',
        customerId: customers[1]._id,
        userId: adminUser._id
      },
      {
        content: 'Potansiyel müşteri, demo istedi.',
        customerId: customers[2]._id,
        userId: adminUser._id
      }
    ]);

    console.log(`${notes.length} not oluşturuldu`);
    console.log('seed işlemi tamamlandı');

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