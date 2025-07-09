// kullanıcı tipleri
export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  email: string;
  password: string;
  name: string;
}

// müşteri tipleri
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

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  tags: string[];
}

// not tipleri
export interface Note {
  _id: string;
  content: string;
  customerId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteInput {
  content: string;
  customerId: string;
}

// api yanıt tipleri
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// form tipleri
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// filtre tipleri
export interface CustomerFilters {
  search?: string;
  tags?: string[];
} 