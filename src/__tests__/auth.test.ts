/**
 * Bu dosya Jest ve Supertest ile yazılmış backend API testlerini içerir.
 * Testler izole bir MongoDB ortamında (mongodb-memory-server) çalışır.
 * Amaç: Register ve Login endpointlerinin doğru çalıştığını kanıtlamak.
 *
 * Not: Gerçek veritabanına dokunulmaz, testler güvenle çalıştırılabilir.
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createAuthResponse, createErrorResponse } from '@/lib/auth';
import { POST as registerHandler } from '../app/api/auth/register/route';
import { POST as loginHandler } from '../app/api/auth/login/route';
import { NextRequest } from 'next/server';

// Yardımcı fonksiyon: NextRequest mock'u oluşturur
function mockRequest(body: any) {
  return {
    json: async () => body,
    headers: new Headers(),
  } as unknown as NextRequest;
}

describe('Auth API', () => {
  let mongoServer: MongoMemoryServer;

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
}); 