/**
 * Bu dosya Jest ve Supertest ile yazılmış backend API testlerini içerir.
 * Testler izole bir MongoDB ortamında (mongodb-memory-server) çalışır.
 * Amaç: Register, Login, Profile, Password ve Avatar endpointlerinin doğru çalıştığını kanıtlamak.
 *
 * Not: Gerçek veritabanına dokunulmaz, testler güvenle çalıştırılabilir.
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createAuthResponse, createErrorResponse } from '@/lib/auth';
import { POST as registerHandler } from '../app/api/auth/register/route';
import { POST as loginHandler } from '../app/api/auth/login/route';
import { PUT as profileHandler } from '../app/api/auth/profile/route';
import { PUT as passwordHandler } from '../app/api/auth/password/route';
import { POST as avatarHandler } from '../app/api/auth/avatar/route';
import { NextRequest } from 'next/server';

// Cloudinary mocku
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        // Mock stream oluştur
        const mockStream = {
          end: jest.fn((buffer) => {
            // Başarılı upload simülasyonu
            callback(null, {
              secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg',
              public_id: 'mini-crm-avatars/test'
            });
          })
        };
        return mockStream;
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' })
    }
  }
}));

// Yardımcı fonksiyon: NextRequest mocku oluşturur
function mockRequest(body: any, token?: string) {
  const headers = new Headers();
  if (token) headers.set('authorization', `Bearer ${token}`);
  return {
    json: async () => body,
    headers,
  } as unknown as NextRequest;
}

// FormData mock'u için yardımcı fonksiyon
function mockFormDataRequest(file: any, token?: string) {
  const headers = new Headers();
  if (token) headers.set('authorization', `Bearer ${token}`);
  return {
    formData: async () => {
      const formData = new FormData();
      formData.append('avatar', file);
      return formData;
    },
    headers,
  } as unknown as NextRequest;
}

describe('Auth API', () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let userId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // bu testte kullanıcı kaydı başarılı şekilde kontrol ediyoruz
  it('kullanıcı kaydı başarılı mı?', async () => {
    const req = mockRequest({
      name: 'Test Kullanıcı',
      email: 'testuser@example.com',
      password: 'test1234'
    });
    const res: any = await registerHandler(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user.email).toBe('testuser@example.com');
    userId = data.data.user._id;
  });

  // bu testte aynı email ile tekrar kayıt deneniyor ve hata bekleniyor
  it('aynı email ile tekrar kayıt başarısız mı?', async () => {
    const req = mockRequest({
      name: 'Test Kullanıcı',
      email: 'testuser@example.com',
      password: 'test1234'
    });
    const res: any = await registerHandler(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
  });

  // bu testte doğru email ve şifre ile login kontrol ediyoruz
  it('login başarılı mı?', async () => {
    const req = mockRequest({
      email: 'testuser@example.com',
      password: 'test1234'
    });
    const res: any = await loginHandler(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.token).toBeDefined();
    token = data.data.token;
  });

  // bu testte yanlış şifre ile login deneniyor ve hata bekleniyor
  it('login başarısız mı?', async () => {
    const req = mockRequest({
      email: 'testuser@example.com',
      password: 'yanlisSifre'
    });
    const res: any = await loginHandler(req);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
  });

  // bu testte profil güncelleme kontrol ediyoruz
  it('profil güncelleme başarılı mı?', async () => {
    const req = mockRequest({
      name: 'Güncellenmiş Kullanıcı',
      email: 'guncellenmis@example.com',
      phone: '+905551234567'
    }, token);
    const res: any = await profileHandler(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Güncellenmiş Kullanıcı');
    expect(data.data.email).toBe('guncellenmis@example.com');
    expect(data.data.phone).toBe('+905551234567');
  });

  // bu testte şifre değiştirme kontrol ediyoruz
  it('şifre değiştirme başarılı mı?', async () => {
    const req = mockRequest({
      currentPassword: 'test1234',
      newPassword: 'yeniSifre123'
    }, token);
    const res: any = await passwordHandler(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Şifre başarıyla değiştirildi');
  });

  // bu testte yanlış mevcut şifre ile şifre değiştirme hatası kontrol ediyoruz
  it('yanlış mevcut şifre ile şifre değiştirme başarısız mı?', async () => {
    const req = mockRequest({
      currentPassword: 'yanlisSifre',
      newPassword: 'yeniSifre123'
    }, token);
    const res: any = await passwordHandler(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Mevcut şifre yanlış');
  });

  // bu testte avatar yükleme kontrol ediyoruz (mock dosya ile)
  it('avatar yükleme başarılı mı?', async () => {
    // Mock dosya oluştur
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const req = mockFormDataRequest(mockFile, token);
    
    // Cloudinary mock'u için environment variable'ları ayarla
    process.env.CLOUDINARY_CLOUD_NAME = 'test';
    process.env.CLOUDINARY_API_KEY = 'test';
    process.env.CLOUDINARY_API_SECRET = 'test';
    
    const res: any = await avatarHandler(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Profil fotoğrafı başarıyla yüklendi');
  });
}); 