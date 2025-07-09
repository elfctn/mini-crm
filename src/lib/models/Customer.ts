import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone?: string;
  tags?: string[];
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: [true, 'müşteri adı zorunludur'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'email zorunludur'],
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'kullanıcı id zorunludur']
  }
}, {
  timestamps: true
});

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema); 