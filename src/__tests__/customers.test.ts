

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { POST as registerHandler } from '../app/api/auth/register/route';
import { POST as loginHandler } from '../app/api/auth/login/route';
import { GET as listCustomers, POST as addCustomer } from '../app/api/customers/route';
import { GET as getCustomer, PUT as updateCustomer, DELETE as deleteCustomer } from '../app/api/customers/[id]/route';
import { NextRequest } from 'next/server';

function mockRequest(body: any, token?: string) {
  const headers = new Headers();
  if (token) headers.set('authorization', `Bearer ${token}`);
  return {
    json: async () => body,
    headers,
    url: 'http://localhost/api/customers',
  } as unknown as NextRequest;
}

function mockGetRequest(url: string, token?: string) {
  const headers = new Headers();
  if (token) headers.set('authorization', `Bearer ${token}`);
  return {
    headers,
    url,
  } as unknown as NextRequest;
}

describe('customers api', () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let customerId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await mongoose.connect(process.env.MONGODB_URI);
    await registerHandler(mockRequest({ name: 'Test', email: 'test@crm.com', password: 'test1234' }));
    const loginRes: any = await loginHandler(mockRequest({ email: 'test@crm.com', password: 'test1234' }));
    const loginData = await loginRes.json();
    token = loginData.data.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // bu testte müşteri ekleniyor mu kontrol ediyoruz
  it('müşteri ekleniyor mu?', async () => {
    const req = mockRequest({ name: 'Ahmet Yılmaz', email: 'ahmet@firma.com', phone: '+905551234567', tags: ['potansiyel', 'b2b'] }, token);
    const res: any = await addCustomer(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.name).toBe('Ahmet Yılmaz');
    customerId = data.data._id;
  });

  // bu testte müşteri listeleniyor mu kontrol ediyoruz
  it('müşteri listeleniyor mu?', async () => {
    const req = mockGetRequest('http://localhost/api/customers', token);
    const res: any = await listCustomers(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
  });

  // bu testte müşteri detayı getiriliyor mu kontrol ediyoruz
  it('müşteri detayı getiriliyor mu?', async () => {
    const req = mockGetRequest(`http://localhost/api/customers/${customerId}`, token);
    const res: any = await getCustomer(req, { params: { id: customerId } });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data._id).toBe(customerId);
  });

  // bu testte müşteri güncelleniyor mu kontrol ediyoruz
  it('müşteri güncelleniyor mu?', async () => {
    const req = mockRequest({ name: 'Ahmet Yılmaz', email: 'ahmet@firma.com', phone: '+905551234567', tags: ['müşteri'] }, token);
    const res: any = await updateCustomer(req, { params: { id: customerId } });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.tags).toContain('müşteri');
  });

  // bu testte müşteri siliniyor mu kontrol ediyoruz
  it('müşteri siliniyor mu?', async () => {
    const req = mockGetRequest(`http://localhost/api/customers/${customerId}`, token);
    const res: any = await deleteCustomer(req, { params: { id: customerId } });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
}); 