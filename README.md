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

---

# Mini CRM - Customer Management Application

🎯 **project purpose**

a simple crm system for small businesses to record, track, and take notes on potential customer (lead) information. in this system, users can add, update, delete, and list customers.

🛠️ **technologies used**

- **frontend & backend**: next.js 14 (app router, server components, api routes)
- **database**: sqlite3 (file-based, no setup required)
- **authentication**: jwt (json web tokens)
- **styling**: tailwindcss v4
- **language**: typescript

📦 **features**

### 🔐 1. login & logout system
- simple email/password user registration and login
- jwt token user authentication
- secure password hashing (bcryptjs)

### 👥 2. customer operations (crud)
- add new customer (name, email, phone, tags)
- view customer list
- update customer information
- delete customer

### 📝 3. note taking
- add special notes to each customer card (date + description)
- update and delete notes

### 🔍 4. search and filtering
- search by name or tags
- filter by tags

## 🚀 installation

### requirements
- node.js 18+
- sqlite3 (automatically installed)

### steps

1. **clone the project**
```bash
git clone <repository-url>
cd mini-crm
```

2. **install dependencies**
```bash
npm install
```

3. **set up environment variables**
```bash
cp env.example .env.local
```

edit the `.env.local` file:
```env
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_SECRET=your-nextauth-secret
```

4. **seed the database (optional)**
```bash
npm run seed
```

5. **start development server**
```bash
npm run dev
```

6. **open in browser**
```
http://localhost:3000
```

**> note: with next.js 14, only next.config.js or next.config.mjs files are supported. do not use next.config.ts.**

## 👤 test user

when the application is first run, a test user is automatically created:

- **email**: admin@minicrm.com
- **password**: admin123

## 📁 project structure

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

## 🧪 testing

you can use the postman collection to test all api endpoints.

1. open postman application
2. click 'import' button and select the 'MiniCRM.postman_collection.json' file from this repo
3. after the collection is added, first run the 'user login (login)' request
4. copy the returned jwt token and paste it in the 'token' variable in postman's 'variables' section
5. now you can test all protected endpoints (customer, note operations)

each request's description and example bodies are available in the collection

## 🚀 deployment

### vercel (recommended)
1. create a vercel account
2. connect your github repository
3. set up environment variables
4. deploy

### other platforms
- **netlify**: with static export
- **railway**: full-stack deployment
- **render**: backend hosting

## 🔧 api endpoints

### authentication
- `post /api/auth/register` - user registration
- `post /api/auth/login` - user login

### customers
- `get /api/customers` - customer list
- `post /api/customers` - new customer
- `put /api/customers/[id]` - update customer
- `delete /api/customers/[id]` - delete customer

### notes
- `get /api/notes?customerId=[id]` - customer notes
- `post /api/notes` - new note
- `put /api/notes/[id]` - update note
- `delete /api/notes/[id]` - delete note

## 🎯 technical features

### next.js 14 app router
- performance optimization with server components
- backend integration with api routes

### sqlite3 integration
- file-based database (no setup required)
- acid compliance
- automatic backup and restore

### jwt authentication
- stateless authentication
- secure token management
- route protection with middleware

### typescript
- type safety
- better developer experience
- intellisense support

## 🤝 contributing

1. fork the project
2. create a feature branch (`git checkout -b feature/amazing-feature`)
3. commit your changes (`git commit -m 'add amazing feature'`)
4. push to the branch (`git push origin feature/amazing-feature`)
5. create a pull request

## 📄 Project Owner
ELIF CETIN


=======

>>>>>>> 81655711f556219c5adcfd39b51dd99e017ee09f

