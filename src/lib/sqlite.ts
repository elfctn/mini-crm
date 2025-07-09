import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { seedDatabase } from './seed-sqlite';
import path from 'path';
import fs from 'fs';

let db: Database | null = null;

// veritabanı başlatma fonksiyonu
export async function initDatabase() {
  if (db) {
    return db;
  }

  try {
    // canlı ortamda dosya yolunu düzelt
    const dbPath = process.env.NODE_ENV === 'production' 
      ? path.join(process.cwd(), 'mini-crm.db')
      : path.join(process.cwd(), 'mini-crm.db');

    // veritabanı dosyasının var olup olmadığını kontrol et
    const dbExists = fs.existsSync(dbPath);

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // kullanıcılar tablosu
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // müşteriler tablosu
    await db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        tags TEXT,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // notlar tablosu
    await db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        customer_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // otomatik seed işlemi (sadece ilk kez)
    try {
      await seedDatabase();
    } catch (error) {
      // seed işlemi zaten yapılmış olabilir
    }

    return db;
  } catch (error) {
    console.error('veritabanı başlatma hatası:', error);
    throw error;
  }
}

// veritabanı bağlantısını al
export async function getDatabase() {
  if (!db) {
    await initDatabase();
  }
  return db;
}

// sql çalıştır (insert, update, delete)
export async function dbRun(sql: string, params: any[] = []): Promise<any> {
  try {
    const database = await getDatabase();
    if (!database) throw new Error('veritabanı bağlantısı başarısız');
    return database.run(sql, params);
  } catch (error) {
    console.error('veritabanı çalıştırma hatası:', error);
    throw error;
  }
}

// tek satır getir
export async function dbGet(sql: string, params: any[] = []): Promise<any> {
  try {
    const database = await getDatabase();
    if (!database) throw new Error('veritabanı bağlantısı başarısız');
    return database.get(sql, params);
  } catch (error) {
    console.error('veritabanı getirme hatası:', error);
    throw error;
  }
}

// tüm satırları getir
export async function dbAll(sql: string, params: any[] = []): Promise<any[]> {
  try {
    const database = await getDatabase();
    if (!database) throw new Error('veritabanı bağlantısı başarısız');
    return database.all(sql, params);
  } catch (error) {
    console.error('veritabanı listeleme hatası:', error);
    throw error;
  }
}

// veritabanı bağlantısını kapat
export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
} 