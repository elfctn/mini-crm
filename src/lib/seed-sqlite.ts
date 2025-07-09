import bcrypt from 'bcryptjs';
import { dbGet, dbRun, dbAll } from './sqlite';

export async function seedDatabase() {
  try {
    console.log('Seed işlemi başlatılıyor...');

    // kullanıcıların var olup olmadığını kontrol et
    const existingUsers = await dbAll('SELECT COUNT(*) as count FROM users');
    const userCount = existingUsers[0]?.count || 0;

    console.log('Mevcut kullanıcı sayısı:', userCount);

    if (userCount > 0) {
      console.log('Seed işlemi zaten yapılmış, atlanıyor...');
      return;
    }

    // demo kullanıcı oluştur
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const result: any = await dbRun(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Admin User', 'admin@minicrm.com', hashedPassword]
    );

    const userId = result.lastID;
    console.log('Demo kullanıcı oluşturuldu:', { id: userId, email: 'admin@minicrm.com' });

    // demo müşteriler oluştur
    const demoCustomers = [
      {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '0532 123 45 67',
        tags: ['potansiyel', 'kurumsal']
      },
      {
        name: 'Ayşe Demir',
        email: 'ayse@example.com',
        phone: '0533 234 56 78',
        tags: ['mevcut', 'bireysel']
      },
      {
        name: 'Mehmet Kaya',
        email: 'mehmet@example.com',
        phone: '0534 345 67 89',
        tags: ['potansiyel', 'startup']
      }
    ];

    for (const customer of demoCustomers) {
      const customerResult: any = await dbRun(
        'INSERT INTO customers (name, email, phone, tags, user_id) VALUES (?, ?, ?, ?, ?)',
        [customer.name, customer.email, customer.phone, JSON.stringify(customer.tags), userId]
      );

      console.log('Demo müşteri oluşturuldu:', { 
        id: customerResult.lastID, 
        name: customer.name,
        email: customer.email 
      });

      // her müşteri için demo notlar oluştur
      const demoNotes = [
        'İlk görüşme yapıldı, proje detayları konuşuldu.',
        'Teklif hazırlandı ve gönderildi.',
        'Takip telefonu yapılacak.'
      ];

      for (const note of demoNotes) {
        await dbRun(
          'INSERT INTO notes (content, customer_id, user_id) VALUES (?, ?, ?)',
          [note, customerResult.lastID, userId]
        );
      }

      console.log('Demo notlar oluşturuldu:', { customerId: customerResult.lastID, noteCount: demoNotes.length });
    }

    console.log('Seed işlemi başarıyla tamamlandı!');
    console.log('Demo hesap bilgileri:');
    console.log('Email: admin@minicrm.com');
    console.log('Şifre: admin123');

  } catch (error) {
    console.error('Seed işlemi hatası:', error);
    throw error;
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