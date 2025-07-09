// kullanıcı tipleri
export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// kullanıcı kayıt formu
export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// kullanıcı giriş formu
export interface LoginForm {
  email: string;
  password: string;
}

// müşteri tipi
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// müşteri ekleme/güncelleme formu
export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  tags: string[];
}

// not tipi
export interface Note {
  _id: string;
  content: string;
  customerId: string;
  customerName?: string; // tüm notlar API'sinden geldiğinde müşteri adı da gelir
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// not ekleme/güncelleme formu
export interface NoteInput {
  content: string;
  customerId: string;
}

// api yanıt tipi
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// auth yanıt tipi
export interface AuthResponse {
  user: User;
  token: string;
}

// müşteri filtre tipi
export interface CustomerFilters {
  search?: string;
  tags?: string[];
} 