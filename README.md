# Mini CRM - Müşteri Takip Uygulaması

## 🌐 Canlı Demo

[mini-crm-elfctns-projects.vercel.app](https://mini-crm-elfctns-projects.vercel.app/)

Küçük işletmeler için basit ve etkili müşteri takip sistemi. Next.js 14, MongoDB Atlas, Mongoose, JWT authentication, Cloudinary ve TailwindCSS ile geliştirilmiştir.

## 🚀 Özellikler

- **Kullanıcı Yönetimi**: JWT tabanlı güvenli authentication
- **Profil Yönetimi**: Kullanıcı bilgilerini güncelleme ve şifre değiştirme
- **Profil Fotoğrafı**: Cloudinary ile avatar yükleme ve yönetimi
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
- **File Upload**: Cloudinary
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

# mongodb atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mini-crm?retryWrites=true&w=majority

# cloudinary configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# development settings
NODE_ENV=development
```

#### Cloudinary Hesabı Oluşturma

1. [cloudinary.com](https://cloudinary.com) adresine gidin
2. Ücretsiz hesap oluşturun
3. Dashboard'dan bilgileri alın:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
4. Bu bilgileri `.env.local` dosyasına ekleyin

### 4. Veritabanını Başlatın

```bash
npm run seed
```

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 🔐 Demo Hesap

Uygulama ilk çalıştırıldığında otomatik olarak demo hesap oluşturulur:

- **Email**: `admin@minicrm.com`
- **Şifre**: `admin123`

Bu hesap ile sistemi test edebilirsiniz.

## 🧪 Test

### Test Çalıştırma

```bash
npm test
```

### Test Kategorileri

- **`src/__tests__/auth.test.ts`** - Kimlik doğrulama testleri
  - Kullanıcı kayıt işlemleri
  - Giriş işlemleri
  - JWT token doğrulama
  - Şifre hashleme testleri

- **`src/__tests__/customers.test.ts`** - Müşteri CRUD testleri
  - Müşteri ekleme işlemleri
  - Müşteri güncelleme işlemleri
  - Müşteri silme işlemleri
  - Müşteri listeleme işlemleri
  - Arama ve filtreleme testleri

- **`src/__tests__/notes.test.ts`** - Not CRUD testleri
  - Not ekleme işlemleri
  - Not güncelleme işlemleri
  - Not silme işlemleri
  - Müşteri bazlı not listeleme
  - Tüm notları listeleme

- **`src/__tests__/components.test.tsx`** - React bileşen testleri
  - AuthProvider render testleri
  - Component wrapper testleri
  - Next.js router mock testleri

## 📄 Dokümantasyon

### API Testleri (Postman)

Postman collection'ı kullanarak API'leri manuel olarak test edebilirsiniz:

#### Kurulum

1. **Postman Collection Import**
   - `MiniCRM.postman_collection.json` dosyasını Postman'e import edin
   - Collection'da tüm endpointler ve örnek veriler hazır

2. **Environment Variables Ayarlayın**
   ```
   base_url: http://localhost:3000
   token: (login endpoint'inden alınan JWT token)
   customerId: (müşteri ekledikten sonra dönen ObjectId)
   noteId: (not ekledikten sonra dönen ObjectId)
   ```

3. **Test Sırası**
   - Önce `authentication/kullanıcı girişi` endpoint'ini çalıştırın
   - Dönen token'ı environment variable'a kaydedin
   - Diğer endpointleri test edin

#### Endpoint Kategorileri

- **Authentication**: Register, Login
- **Customers**: CRUD işlemleri, Arama, Filtreleme
- **Notes**: CRUD işlemleri, Müşteri bazlı listeleme

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
│   ├── types/             # TypeScript type definitions
│   └── __tests__/         # Test dosyaları
│       ├── auth.test.ts   # Authentication testleri
│       ├── customers.test.ts # Customer CRUD testleri
│       ├── notes.test.ts  # Note CRUD testleri
│       └── components.test.tsx # React bileşen testleri
├── public/                # Static assets
├── .env.example           # Environment variables template
├── jest.config.js         # Jest configuration
├── next.config.js         # Next.js configuration
├── package.json           # Dependencies and scripts
├── README.md              # Project documentation
├── tailwind.config.js     # TailwindCSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🚀 Deployment

### Vercel (Önerilen)

1. [Vercel](https://vercel.com) hesabı oluşturun
2. GitHub repository'nizi bağlayın
3. Environment variables'ları ayarlayın:
   - `JWT_SECRET`
   - `MONGODB_URI`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Deploy edin!

### Diğer Platformlar

- **Netlify**: Static export ile
- **Railway**: Full-stack deployment
- **Heroku**: Container deployment

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'feat: add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 👨‍💻 Geliştirici

**Elif Çetin** - [@elfctn](https://github.com/elfctn)

---

**Not**: Bu proje eğitim amaçlı geliştirilmiştir. Production kullanımı için güvenlik önlemlerini artırmanız önerilir.

