# Mini CRM - Müşteri Takip Uygulaması

Küçük işletmeler için basit ve etkili müşteri takip sistemi. Next.js 14, MongoDB Atlas, Mongoose, JWT authentication ve TailwindCSS ile geliştirilmiştir.

## 🚀 Özellikler

- **Kullanıcı Yönetimi**: JWT tabanlı güvenli authentication
- **Müşteri Yönetimi**: Tam CRUD operasyonları (Ekleme, Okuma, Güncelleme, Silme)
- **Not Sistemi**: Müşteriler için not ekleme ve yönetimi
- **Arama ve Filtreleme**: Müşteri arama ve etiket bazlı filtreleme
- **Responsive Tasarım**: Mobil uyumlu modern arayüz
- **Canlı Ortam Desteği**: Production-ready yapılandırma

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS
- **Backend**: Next.js API Routes
- **Veritabanı**: MongoDB Atlas, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Deployment**: Vercel (önerilen)

## 📋 Gereksinimler

- Node.js 18+ 
- npm veya yarn

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd mini-crm
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Environment Variables Ayarlayın

`.env.local` dosyası oluşturun:

```bash
cp env.example .env.local
```

`.env.local` dosyasını düzenleyin:

```env
# jwt secret - canlı ortamda mutlaka değiştirin!
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production

# nextauth secret (opsiyonel)
NEXTAUTH_SECRET=your-nextauth-secret-key

# mongodb atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-crm?retryWrites=true&w=majority

# canlı ortam ayarları
NODE_ENV=production
```

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 🔐 Demo Hesap

Uygulama ilk çalıştırıldığında otomatik olarak demo hesap oluşturulur:

- **Email**: `admin@minicrm.com`
- **Şifre**: `admin123`

## 📱 Kullanım

### Giriş Yapma
1. `/login` sayfasına gidin
2. Demo hesap bilgileriyle giriş yapın
3. Başarılı girişten sonra müşteri listesine yönlendirilirsiniz

### Müşteri Yönetimi
- **Müşteri Ekleme**: "Yeni Müşteri" butonuna tıklayın
- **Müşteri Düzenleme**: Müşteri kartındaki "Düzenle" butonuna tıklayın
- **Müşteri Silme**: Müşteri detay sayfasındaki "Sil" butonuna tıklayın
- **Arama**: Üst kısımdaki arama kutusunu kullanın
- **Filtreleme**: Etiketlere göre filtreleme yapın

### Not Yönetimi
- **Not Ekleme**: Müşteri detay sayfasında not ekleyin
- **Not Düzenleme**: Not üzerindeki "Düzenle" butonuna tıklayın
- **Not Silme**: Not üzerindeki "Sil" butonuna tıklayın

## 🌐 Canlı Ortam (Production) Kurulumu

### Vercel ile Deploy

1. **Vercel'e Bağlanın**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Environment Variables Ayarlayın**
   - Vercel dashboard'da projenizi seçin
   - Settings > Environment Variables bölümüne gidin
   - Aşağıdaki değişkenleri ekleyin:
     ```
     JWT_SECRET=your-production-jwt-secret-key
     MONGODB_URI=your-mongodb-atlas-connection-string
     NODE_ENV=production
     ```

3. **Deploy Edin**
   ```bash
   vercel --prod
   ```

## 🧪 Test

### API Testleri

Postman collection'ı kullanarak API'leri test edebilirsiniz:
- `MiniCRM.postman_collection.json` dosyasını Postman'e import edin
- Environment variables'ları ayarlayın
- Test senaryolarını çalıştırın

### Manuel Test Senaryoları

1. **Authentication Test**
   - Login/Register işlemleri
   - Token expiration kontrolü
   - Protected route access

2. **CRUD Testleri**
   - Müşteri ekleme/düzenleme/silme
   - Not ekleme/düzenleme/silme
   - Arama ve filtreleme

3. **Canlı Ortam Testleri**
   - Production deployment kontrolü
   - Database persistence
   - Environment variable kontrolü

## 📁 Proje Yapısı

```
mini-crm/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Authentication endpoints
│   │   │   ├── customers/ # Customer CRUD endpoints
│   │   │   └── notes/     # Note CRUD endpoints
│   │   ├── customers/     # Customer pages
│   │   ├── notes/         # Notes page
│   │   ├── login/         # Login page
│   │   └── register/      # Register page
│   ├── lib/               # Utility functions
│   │   ├── auth.ts        # Authentication helpers
│   │   ├── jwt.ts         # JWT utilities
│   │   ├── mongodb.ts     # MongoDB connection
│   │   ├── models/        # Mongoose modelleri
│   │   └── seed-mongodb.ts# MongoDB seed script
│   ├── providers/         # React context providers
│   │   └── AuthProvider.tsx
│   └── types/             # TypeScript type definitions
├── public/                # Static assets
└── README.md
```

## 🔧 Geliştirme

### Yeni Özellik Ekleme

1. **API Route Oluşturma**
   ```typescript
   // src/app/api/feature/route.ts
   export async function GET(request: NextRequest) {
     // ... implementation
   }
   ```

2. **Frontend Sayfası Oluşturma**
   ```typescript
   // src/app/feature/page.tsx
   'use client';
   import { useAuth } from '@/providers/AuthProvider';
   // ... implementation
   ```

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **"Database connection failed" Hatası**
   - MONGODB_URI environment variable'ını kontrol edin
   - MongoDB Atlas bağlantı izinlerini kontrol edin

2. **"Authentication failed" Hatası**
   - JWT_SECRET environment variable'ını kontrol edin
   - Token'ın geçerliliğini kontrol edin

3. **"Cannot read property of null" Hatası**
   - localStorage erişimini kontrol edin
   - Client-side rendering sorunlarını kontrol edin

### Debug Modu

Geliştirme sırasında console loglarını aktif tutun:
- API route'larda detaylı logging
- AuthProvider'da token kontrol logları
- Database işlemlerinde debug bilgileri

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 İletişim

Proje ile ilgili sorularınız için:
- GitHub Issues kullanın
- Email: [your-email@example.com]

---

**Not**: Bu proje eğitim amaçlı geliştirilmiştir. Production kullanımı için güvenlik önlemlerini artırmanız önerilir.

