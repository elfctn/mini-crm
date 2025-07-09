'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';

// auth context tipi
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// auth provider bileşeni
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // public routes - authentication gerektirmeyen sayfalar
  const publicRoutes = ['/', '/login', '/register'];

  // kullanıcı kimlik doğrulamasını kontrol et
  const checkAuth = async (): Promise<boolean> => {
    try {
      // localStorage'a erişim kontrolü
      if (typeof window === 'undefined') {
        return false;
      }

      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        return false;
      }

      // token'ı decode et ve süresini kontrol et
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        // token süresi dolmuş
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        return false;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      return true;
    } catch (error) {
      console.error('auth kontrol hatası:', error);
      // hata durumunda temizle
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setUser(null);
      return false;
    }
  };

  // kullanıcı çıkış yap
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setUser(null);
    router.push('/login');
  };

  // auth durumunu kontrol et ve yönlendir
  useEffect(() => {
    const handleAuth = async () => {
      const isPublicRoute = publicRoutes.includes(pathname);
      const isAuthenticated = await checkAuth();

      if (!isAuthenticated && !isPublicRoute) {
        // kullanıcı giriş yapmamış ve public route değilse login'e yönlendir
        router.push('/login');
      } else if (isAuthenticated && isPublicRoute && pathname !== '/') {
        // kullanıcı giriş yapmış ve public route'daysa customers'a yönlendir
        router.push('/customers');
      }

      setLoading(false);
    };

    handleAuth();
  }, [pathname]);

  const value = {
    user,
    loading,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// auth hook'u
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 