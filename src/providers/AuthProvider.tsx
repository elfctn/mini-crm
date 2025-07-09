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
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      return false;
    }

    try {
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
      console.error('Auth check error:', error);
      // hata durumunda temizle
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

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