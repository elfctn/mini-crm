# Mini CRM - Müşteri Takip Uygulaması

🎯 **Proje Amacı**

Küçük işletmelerin potansiyel müşteri (lead) bilgilerini kaydedebileceği, takip edebileceği ve not alabileceği basit bir CRM sistemi. Bu sistemde kullanıcılar müşteri ekleyebilir, güncelleyebilir, silebilir ve listeleyebilir.

🛠️ **Kullanılan Teknolojiler**

- **Frontend & Backend**: Next.js 15 (App Router, Server Components, API Routes)
- **Veritabanı**: SQLite3 (File-based, no setup required)
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: TailwindCSS v4
- **Language**: TypeScript
- **Development**: Turbopack for faster builds

📦 **Özellikler**

### 🔐 1. Giriş & Çıkış Sistemi
- Basit e-posta/şifre ile kullanıcı kaydı ve girişi
- JWT token ile kullanıcı doğrulama
- Güvenli şifre hashleme (bcryptjs)

### 👥 2. Müşteri İşlemleri (CRUD)
- Yeni müşteri ekleme (ad, e-posta, telefon, etiket)
- Müşteri listesini görüntüleme
- Müşteri bilgilerini güncelleme
- Müşteri silme

### 📝 3. Not Ekleme
- Her müşteri kartına özel notlar ekleyebilme (tarih + açıklama)
- Notları güncelleme ve silme

### 🔍 4. Arama ve Filtreleme
- İsim veya etiketle arama
- Etikete göre filtreleme

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- SQLite3 (otomatik olarak yüklenir)

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd mini-crm
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın**
```bash
cp env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_SECRET=your-nextauth-secret
```

4. **Veritabanını seed edin (opsiyonel)**
```bash
npm run seed
```

5. **Development server'ı başlatın**
```bash
npm run dev
```

6. **Tarayıcıda açın**
```
http://localhost:3000
```

## 👤 Test Kullanıcısı

Uygulama ilk çalıştırıldığında otomatik olarak bir test kullanıcısı oluşturulur:

- **Email**: admin@minicrm.com
- **Şifre**: admin123

## 📁 Proje Yapısı

```
mini-crm/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── customers/
│   │   │   └── notes/
│   │   ├── customers/
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   ├── lib/
│   │   ├── sqlite.ts
│   │   ├── auth.ts
│   │   └── seed-sqlite.ts
│   ├── types/
│   └── hooks/
├── public/
├── mini-crm.db (SQLite database)
└── package.json
```

## 🧪 test

tüm api endpointlerini test etmek için postman koleksiyonu kullanabilirsin.

1. postman uygulamasını aç
2. 'import' butonuna tıkla ve bu repodaki 'MiniCRM.postman_collection.json' dosyasını seç
3. koleksiyon eklendikten sonra önce 'kullanıcı girişi (login)' isteğini çalıştır
4. dönen jwt token'ı kopyala ve postman'da 'variables' kısmında 'token' değişkenine yapıştır
5. artık tüm korumalı endpointleri (müşteri, not işlemleri) test edebilirsin

her isteğin açıklaması ve örnek body'leri koleksiyonda mevcut

## 🚀 Deployment

### Vercel (Önerilen)
1. Vercel hesabı oluşturun
2. GitHub repository'nizi bağlayın
3. Environment variables'ları ayarlayın
4. Deploy edin

### Diğer Platformlar
- **Netlify**: Static export ile
- **Railway**: Full-stack deployment
- **Render**: Backend hosting

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi

### Customers
- `GET /api/customers` - Müşteri listesi
- `POST /api/customers` - Yeni müşteri
- `PUT /api/customers/[id]` - Müşteri güncelleme
- `DELETE /api/customers/[id]` - Müşteri silme

### Notes
- `GET /api/notes?customerId=[id]` - Müşteri notları
- `POST /api/notes` - Yeni not
- `PUT /api/notes/[id]` - Not güncelleme
- `DELETE /api/notes/[id]` - Not silme

## 🎯 Teknik Özellikler

### Next.js 15 App Router
- Server Components ile performans optimizasyonu
- API Routes ile backend entegrasyonu
- Turbopack ile hızlı development

### SQLite3 Entegrasyonu
- File-based database (kurulum gerektirmez)
- ACID compliance
- Otomatik backup ve restore

### JWT Authentication
- Stateless authentication
- Secure token management
- Middleware ile route protection

### TypeScript
- Type safety
- Better developer experience
- IntelliSense support

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Proje Sahibi - [@your-twitter](https://twitter.com/your-twitter)

Proje Linki: [https://github.com/your-username/mini-crm](https://github.com/your-username/mini-crm)
