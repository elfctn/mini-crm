import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Note from '@/lib/models/Note';
import Customer from '@/lib/models/Customer';
import { authenticateUser, createErrorResponse } from '@/lib/auth';

// get - kullanıcının tüm notları
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    // kullanıcının tüm notlarını ve müşteri adını getir
    const notes = await Note.find({ userId: user._id }).sort({ createdAt: -1 });
    // müşteri adlarını topluca çekmek için id'leri topla
    const customerIds = notes.map((note: any) => note.customerId);
    const customers = await Customer.find({ _id: { $in: customerIds } });
    const customerMap = new Map(customers.map((c: any) => [c._id.toString(), c.name]));
    const formattedNotes = notes.map((note: any) => ({
      _id: note._id.toString(),
      content: note.content,
      customerId: note.customerId.toString(),
      customerName: customerMap.get(note.customerId.toString()) || '',
      userId: note.userId.toString(),
      createdAt: note.createdAt.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
      updatedAt: note.updatedAt.toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })
    }));
    return Response.json({
      success: true,
      data: formattedNotes
    });
  } catch (error) {
    console.error('Get all notes error:', error);
    return createErrorResponse('Not listesi alınamadı', 500);
  }
} 