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
- **otomatik route protection** - giriş yapmamış kullanıcılar korumalı sayfalara erişemez
- **otomatik yönlendirme** - giriş yapmış kullanıcılar ana sayfa/login/register sayfalarından customers sayfasına yönlendirilir

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

### 🛡️ 5. authentication middleware
- **AuthProvider**: tüm uygulamada authentication durumunu yönetir
- **ProtectedRoute**: korumalı sayfalar için wrapper component
- **useAuth hook**: authentication durumuna erişim sağlar
- **otomatik token kontrolü**: her sayfa yüklendiğinde token geçerliliği kontrol edilir

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

**alternatif olarak sabit port kullanmak için:**
```bash
npm run dev -- -p 3000
```

6. **tarayıcıda açın**
```
http://localhost:3000
```

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

### authentication middleware
- **AuthProvider**: context-based authentication state management
- **ProtectedRoute**: route protection wrapper
- **useAuth hook**: authentication utilities
- **automatic redirects**: smart navigation based on auth state

## 🛡️ güvenlik özellikleri

### route protection
- korumalı sayfalar: `/customers`, `/customers/new`, `/customers/[id]`
- public sayfalar: `/`, `/login`, `/register`
- otomatik yönlendirme: giriş yapmış kullanıcılar public sayfalardan customers'a yönlendirilir
- otomatik login kontrolü: giriş yapmamış kullanıcılar korumalı sayfalardan login'e yönlendirilir

### token management
- localStorage'da güvenli token saklama
- otomatik token geçerlilik kontrolü
- otomatik logout: geçersiz token durumunda kullanıcı çıkış yapar

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
- **automatic route protection** - unauthenticated users cannot access protected pages
- **automatic redirects** - authenticated users are redirected from public pages to customers page

### 👥 2. customer operations (crud)
- add new customers (name, email, phone, tags)
- view customer list
- update customer information
- delete customers

### 📝 3. note taking
- add special notes to each customer card (date + description)
- update and delete notes

### 🔍 4. search and filtering
- search by name or tags
- filter by tags

### 🛡️ 5. authentication middleware
- **AuthProvider**: manages authentication state across the entire application
- **ProtectedRoute**: wrapper component for protected pages
- **useAuth hook**: provides access to authentication state
- **automatic token validation**: token validity is checked on every page load

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

edit `.env.local` file:
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

**alternative with fixed port:**
```bash
npm run dev -- -p 3000
```

6. **open in browser**
```
http://localhost:3000
```

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

### authentication middleware
- **AuthProvider**: context-based authentication state management
- **ProtectedRoute**: route protection wrapper
- **useAuth hook**: authentication utilities
- **automatic redirects**: smart navigation based on auth state

## 🛡️ security features

### route protection
- protected pages: `/customers`, `/customers/new`, `/customers/[id]`
- public pages: `/`, `/login`, `/register`
- automatic redirects: authenticated users are redirected from public pages to customers
- automatic login check: unauthenticated users are redirected from protected pages to login

### token management
- secure token storage in localStorage
- automatic token validity checking
- automatic logout: user is logged out when token is invalid

## 🤝 contributing

1. fork the project
2. create feature branch (`git checkout -b feature/amazing-feature`)
3. commit changes (`git commit -m 'add amazing feature'`)
4. push to branch (`git push origin feature/amazing-feature`)
5. create pull request

## 📄 Project Owner
ELIF CETIN


=======

>>>>>>> 81655711f556219c5adcfd39b51dd99e017ee09f

