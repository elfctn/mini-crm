import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Note from '@/lib/models/Note';
import Customer from '@/lib/models/Customer';
import { authenticateUser, createErrorResponse } from '@/lib/auth';
import { NoteInput } from '@/types';
import mongoose from 'mongoose';

// tüm notlar endpoint'i
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    // kullanıcının tüm notlarını getir
    const notes = await Note.find({ userId: user._id }).sort({ createdAt: -1 });
    // notları formatla
    const formattedNotes = notes.map((note: any) => ({
      _id: note._id.toString(),
      content: note.content,
      customerId: note.customerId.toString(),
      userId: note.userId.toString(),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt
    }));
    return Response.json({
      success: true,
      data: formattedNotes
    });
  } catch (error) {
    console.error('not listesi hatası:', error);
    return createErrorResponse('not listesi alınamadı', 500);
  }
}

// yeni not ekleme endpoint'i
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const user = await authenticateUser(request);
    const body: NoteInput = await request.json();
    const { content, customerId } = body;
    if (!content || !customerId) {
      return createErrorResponse('içerik ve müşteri id gereklidir', 400);
    }
    // müşterinin var olup olmadığını kontrol et
    const customer = await Customer.findOne({ _id: customerId, userId: user._id });
    if (!customer) {
      return createErrorResponse('müşteri bulunamadı', 404);
    }
    // yeni not ekle
    const newNote = await Note.create({
      content,
      customerId: new mongoose.Types.ObjectId(customerId),
      userId: new mongoose.Types.ObjectId(user._id)
    });
    const formattedNote = {
      _id: newNote._id.toString(),
      content: newNote.content,
      customerId: newNote.customerId.toString(),
      userId: newNote.userId.toString(),
      createdAt: newNote.createdAt,
      updatedAt: newNote.updatedAt
    };
    return Response.json({
      success: true,
      data: formattedNote,
      message: 'not başarıyla eklendi'
    });
  } catch (error) {
    console.error('not ekleme hatası:', error);
    return createErrorResponse('not eklenemedi', 500);
  }
} 