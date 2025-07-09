# Mini CRM - Müşteri Takip Uygulaması

🎯 **proje amacı**

küçük işletmelerin potansiyel müşteri (lead) bilgilerini kaydedebileceği, takip edebileceği ve not alabileceği basit bir crm sistemi. bu sistemde kullanıcılar müşteri ekleyebilir, güncelleyebilir, silebilir ve listeleyebilir.

🛠️ **kullanılan teknolojiler**

- **frontend & backend**: next.js 14 (app router, server components, api routes)
- **veritabanı**: sqlite3 (file-based, no setup required)
- **authentication**: jwt (json web tokens)
- **styling**: tailwindcss v4
- **language**: typescript

📦 **özellikler**

### 🔐 1. giriş & çıkış sistemi
- basit e-posta/şifre ile kullanıcı kaydı ve girişi
- jwt token ile kullanıcı doğrulama
- güvenli şifre hashleme (bcryptjs)

### 👥 2. müşteri işlemleri (crud)
- yeni müşteri ekleme (ad, e-posta, telefon, etiket)
- müşteri listesini görüntüleme
- müşteri bilgilerini güncelleme
- müşteri silme

### 📝 3. not ekleme
- her müşteri kartına özel notlar ekleyebilme (tarih + açıklama)
- notları güncelleme ve silme

### 🔍 4. arama ve filtreleme
- isim veya etiketle arama
- etikete göre filtreleme

## 🚀 kurulum

### gereksinimler
- node.js 18+
- sqlite3 (otomatik olarak yüklenir)

### adımlar

1. **projeyi klonlayın**
```bash
git clone <repository-url>
cd mini-crm
```

2. **bağımlılıkları yükleyin**
```bash
npm install
```

3. **environment değişkenlerini ayarlayın**
```bash
cp env.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_SECRET=your-nextauth-secret
```

4. **veritabanını seed edin (opsiyonel)**
```bash
npm run seed
```

5. **development server'ı başlatın**
```bash
npm run dev
```

6. **tarayıcıda açın**
```
http://localhost:3000
```


**> not: next.js 14 ile sadece next.config.js veya next.config.mjs dosyası desteklenir. next.config.ts kullanmayın.**


## 👤 test kullanıcısı

uygulama ilk çalıştırıldığında otomatik olarak bir test kullanıcısı oluşturulur:

- **email**: admin@minicrm.com
- **şifre**: admin123

## 📁 proje yapısı

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
│   ├── lib/
│   │   ├── sqlite.ts
│   │   ├── auth.ts
│   │   └── seed-sqlite.ts
│   ├── types/
├── public/
├── mini-crm.db (sqlite database)
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

## 🚀 deployment

### vercel (önerilen)
1. vercel hesabı oluşturun
2. github repository'nizi bağlayın
3. environment variables'ları ayarlayın
4. deploy edin

### diğer platformlar
- **netlify**: static export ile
- **railway**: full-stack deployment
- **render**: backend hosting

## 🔧 api endpoints

### authentication
- `post /api/auth/register` - kullanıcı kaydı
- `post /api/auth/login` - kullanıcı girişi

### customers
- `get /api/customers` - müşteri listesi
- `post /api/customers` - yeni müşteri
- `put /api/customers/[id]` - müşteri güncelleme
- `delete /api/customers/[id]` - müşteri silme

### notes
- `get /api/notes?customerId=[id]` - müşteri notları
- `post /api/notes` - yeni not
- `put /api/notes/[id]` - not güncelleme
- `delete /api/notes/[id]` - not silme

## 🎯 teknik özellikler

### next.js 14 app router
- server components ile performans optimizasyonu
- api routes ile backend entegrasyonu

### sqlite3 entegrasyonu
- file-based database (kurulum gerektirmez)
- acid compliance
- otomatik backup ve restore

### jwt authentication
- stateless authentication
- secure token management
- middleware ile route protection

### typescript
- type safety
- better developer experience
- intellisense support

## 🤝 katkıda bulunma

1. fork edin
2. feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. commit edin (`git commit -m 'add amazing feature'`)
4. push edin (`git push origin feature/amazing-feature`)
5. pull request oluşturun

## 📄 Proje Sahibi
ELIF CETIN


