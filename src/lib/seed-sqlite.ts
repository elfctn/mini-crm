import bcrypt from 'bcryptjs';
import { initDatabase, dbRun, dbGet, dbAll, closeDatabase } from './sqlite';

export async function seedDatabase() {
  try {
    await initDatabase();

    // test kullanıcısı var mı? kontrol et
    const existingUser = await dbGet('SELECT * FROM users WHERE email = ?', ['admin@minicrm.com']);
    
    if (existingUser) {
      console.log('Test kullanıcısı zaten mevcut');
      return;
    }

    // test kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userResult = await dbRun(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Admin User', 'admin@minicrm.com', hashedPassword]
    );

    const userId = userResult.lastID;
    console.log('Test kullanıcısı oluşturuldu: admin@minicrm.com');

    // Örnek müşteriler oluştur
    const customers = [
      {
        name: 'Ahmet Yılmaz',
        email: 'ahmet@example.com',
        phone: '+905551234567',
        tags: JSON.stringify(['potansiyel', 'yazılım'])
      },
      {
        name: 'Ayşe Demir',
        email: 'ayse@example.com',
        phone: '+905559876543',
        tags: JSON.stringify(['mevcut', 'e-ticaret'])
      },
      {
        name: 'Mehmet Kaya',
        email: 'mehmet@example.com',
        phone: '+905551112223',
        tags: JSON.stringify(['potansiyel', 'finans'])
      }
    ];

    const customerIds = [];
    for (const customer of customers) {
      const result = await dbRun(
        'INSERT INTO customers (name, email, phone, tags, user_id) VALUES (?, ?, ?, ?, ?)',
        [customer.name, customer.email, customer.phone, customer.tags, userId]
      );
      customerIds.push(result.lastID);
    }

    console.log(`${customers.length} örnek müşteri oluşturuldu`);

    // örnek notlar oluştur
    const notes = [
      {
        content: 'Müşteri ile ilk görüşme yapıldı. Yazılım projesi hakkında detaylı bilgi verildi.',
        customerId: customerIds[0]
      },
      {
        content: 'Fiyat teklifi gönderildi. 1 hafta içinde geri dönüş bekleniyor.',
        customerId: customerIds[0]
      },
      {
        content: 'E-ticaret sitesi için özel çözüm önerisi hazırlandı.',
        customerId: customerIds[1]
      },
      {
        content: 'Finansal danışmanlık hizmeti için görüşme planlandı.',
        customerId: customerIds[2]
      }
    ];

    for (const note of notes) {
      await dbRun(
        'INSERT INTO notes (content, customer_id, user_id) VALUES (?, ?, ?)',
        [note.content, note.customerId, userId]
      );
    }

    console.log(`${notes.length} örnek not oluşturuldu`);
    console.log('Seed işlemi tamamlandı!');

  } catch (error) {
    console.error('Seed işlemi başarısız:', error);
  } finally {
    closeDatabase();
  }
}


//seed işlemiveritabanına başlangıç örnek verilerini ekleme işlemidir
// eğer bu dosya doğrudan çalıştırılırsa seed işlemi yapılacak
if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Seed hatası:', error);
    process.exit(1);
  });
} 