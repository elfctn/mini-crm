import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { POST as registerHandler } from '../app/api/auth/register/route';
import { POST as loginHandler } from '../app/api/auth/login/route';
import { POST as addCustomer } from '../app/api/customers/route';
import { POST as addNote, GET as listNotes } from '../app/api/notes/route';
import { PUT as updateNote, DELETE as deleteNote } from '../app/api/notes/[id]/route';
import { GET as listAllNotes } from '../app/api/notes/all/route';
import { NextRequest } from 'next/server';

function mockRequest(body: any, token?: string) {
  const headers = new Headers();
  if (token) headers.set('authorization', `Bearer ${token}`);
  return {
    json: async () => body,
    headers,
    url: 'http://localhost/api/notes',
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

describe('notes api', () => {
  let mongoServer: MongoMemoryServer;
  let token: string;
  let customerId: string;
  let noteId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await mongoose.connect(process.env.MONGODB_URI);
    await registerHandler(mockRequest({ name: 'Test', email: 'test@crm.com', password: 'test1234' }));
    const loginRes: any = await loginHandler(mockRequest({ email: 'test@crm.com', password: 'test1234' }));
    const loginData = await loginRes.json();
    token = loginData.data.token;
    // müşteri ekle
    const customerRes: any = await addCustomer(mockRequest({ name: 'Ahmet Yılmaz', email: 'ahmet@firma.com', phone: '+905551234567', tags: ['potansiyel'] }, token));
    const customerData = await customerRes.json();
    customerId = customerData.data._id;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // bu testte not ekleniyor mu kontrol ediyoruz
  it('not ekleniyor mu?', async () => {
    const req = mockRequest({ content: 'ilk görüşme yapıldı', customerId }, token);
    const res: any = await addNote(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.content).toBe('ilk görüşme yapıldı');
    noteId = data.data._id;
  });

  // bu testte müşteri bazlı notlar listeleniyor mu kontrol ediyoruz
  it('müşteri bazlı notlar listeleniyor mu?', async () => {
    const req = mockGetRequest(`http://localhost/api/notes?customerId=${customerId}`, token);
    const res: any = await listNotes(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0].customerId).toBe(customerId);
  });

  // bu testte tüm notlar listeleniyor mu kontrol ediyoruz
  it('tüm notlar listeleniyor mu?', async () => {
    const req = mockGetRequest('http://localhost/api/notes/all', token);
    const res: any = await listAllNotes(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0]).toHaveProperty('customerName');
    expect(data.data[0]).toHaveProperty('content');
  });

  // bu testte not güncelleniyor mu kontrol ediyoruz
  it('not güncelleniyor mu?', async () => {
    const req = mockRequest({ content: 'görüşme olumlu geçti' }, token);
    const res: any = await updateNote(req, { params: { id: noteId } });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.content).toBe('görüşme olumlu geçti');
  });

  // bu testte not siliniyor mu kontrol ediyoruz
  it('not siliniyor mu?', async () => {
    const req = mockGetRequest(`http://localhost/api/notes/${noteId}`, token);
    const res: any = await deleteNote(req, { params: { id: noteId } });
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
}); 