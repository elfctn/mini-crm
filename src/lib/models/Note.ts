import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  content: string;
  customerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>({
  content: {
    type: String,
    required: [true, 'not içeriği zorunludur'],
    trim: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'müşteri id zorunludur']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'kullanıcı id zorunludur']
  }
}, {
  timestamps: true
});

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema); 