import mongoose from 'mongoose';

// mongodb bağlantısı
export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('mongodb atlas bağlantısı başarılı');
    return mongoose.connection;
  } catch (error) {
    console.error('mongodb bağlantı hatası:', error);
    throw error;
  }
}

// bağlantıyı kapat
export async function disconnectFromDatabase() {
  try {
    await mongoose.disconnect();
    console.log('mongodb bağlantısı kapatıldı');
  } catch (error) {
    console.error('mongodb bağlantı kapatma hatası:', error);
  }
} 