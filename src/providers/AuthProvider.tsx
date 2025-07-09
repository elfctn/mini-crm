'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // public routes - authentication gerektirmeyen sayfalar
  const publicRoutes = ['/', '/login', '/register'];

  const checkAuth = async (): Promise<boolean> => {
    try {
      // localStorage'a erişim kontrolü
      if (typeof window === 'undefined') {
        return false;
      }

      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        console.log('Token veya user data bulunamadı');
        return false;
      }

      // token'ı decode et ve süresini kontrol et
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      console.log('Token kontrolü:', { 
        exp: payload.exp, 
        currentTime, 
        isValid: payload.exp > currentTime 
      });
      
      if (payload.exp < currentTime) {
        // token süresi dolmuş
        console.log('Token süresi dolmuş');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        return false;
      }

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      console.log('Kullanıcı doğrulandı:', parsedUser.name);
      return true;
    } catch (error) {
      console.error('Auth check error:', error);
      // hata durumunda temizle
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setUser(null);
      return false;
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setUser(null);
    router.push('/login');
  };

  useEffect(() => {
    const handleAuth = async () => {
      console.log('Auth kontrolü başlatılıyor:', { pathname });
      
      const isPublicRoute = publicRoutes.includes(pathname);
      const isAuthenticated = await checkAuth();

      console.log('Auth durumu:', { isPublicRoute, isAuthenticated, pathname });

      if (!isAuthenticated && !isPublicRoute) {
        // kullanıcı giriş yapmamış ve public route değilse login'e yönlendir
        console.log('Login sayfasına yönlendiriliyor');
        router.push('/login');
      } else if (isAuthenticated && isPublicRoute && pathname !== '/') {
        // kullanıcı giriş yapmış ve public route'daysa customers'a yönlendir
        console.log('Customers sayfasına yönlendiriliyor');
        router.push('/customers');
      }

      setLoading(false);
    };

    handleAuth();
  }, [pathname]); // router'ı dependency'den çıkardım

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 