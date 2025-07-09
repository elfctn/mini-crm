import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { seedDatabase } from './seed-sqlite';
import path from 'path';

let db: Database | null = null;

export async function initDatabase() {
  if (db) {
    return db;
  }

  try {
    // canlı ortamda dosya yolunu düzelt
    const dbPath = process.env.NODE_ENV === 'production' 
      ? path.join(process.cwd(), 'mini-crm.db')
      : './mini-crm.db';

    console.log('Veritabanı yolu:', dbPath);

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // tabloları oluştur
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
      console.log('Seed işlemi zaten yapılmış veya hata oluştu:', error);
    }

    console.log('Veritabanı başarıyla başlatıldı');
    return db;
  } catch (error) {
    console.error('Veritabanı başlatma hatası:', error);
    throw error;
  }
}

export async function getDatabase() {
  if (!db) {
    await initDatabase();
  }
  return db;
}

export async function dbRun(sql: string, params: any[] = []): Promise<any> {
  try {
    const database = await getDatabase();
    if (!database) throw new Error('Database connection failed');
    return database.run(sql, params);
  } catch (error) {
    console.error('Database run error:', error);
    throw error;
  }
}

export async function dbGet(sql: string, params: any[] = []): Promise<any> {
  try {
    const database = await getDatabase();
    if (!database) throw new Error('Database connection failed');
    return database.get(sql, params);
  } catch (error) {
    console.error('Database get error:', error);
    throw error;
  }
}

export async function dbAll(sql: string, params: any[] = []): Promise<any[]> {
  try {
    const database = await getDatabase();
    if (!database) throw new Error('Database connection failed');
    return database.all(sql, params);
  } catch (error) {
    console.error('Database all error:', error);
    throw error;
  }
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
} 