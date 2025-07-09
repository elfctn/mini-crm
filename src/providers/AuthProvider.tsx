'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // public routes - authentication gerektirmeyen sayfalar
  const publicRoutes = ['/', '/login', '/register'];

  const checkAuth = (): boolean => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      return false;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      return true;
    } catch (error) {
      console.error('User data parse error:', error);
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
    const isPublicRoute = publicRoutes.includes(pathname);
    const isAuthenticated = checkAuth();

    if (!isAuthenticated && !isPublicRoute) {
      // kullanıcı giriş yapmamış ve public route değilse logine yönlendir
      router.push('/login');
    } else if (isAuthenticated && isPublicRoute && pathname !== '/') {
      // kullanıcı giriş yapmış ve public routedaysa customersa yönlendir
      router.push('/customers');
    }

    setLoading(false);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 