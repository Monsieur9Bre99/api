import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true, index: true })
  user_id: string;

  @Prop({ required: true, index: true })
  category: string;

  @Prop({ type: Types.ObjectId, ref: 'Template', index: true })
  template_id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  content?: string;

  @Prop({ type: mongoose.Schema.Types.Mixed })
  payload: Record<string, any>;

  @Prop({
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: [String], enum: ['inapp', 'email', 'push', 'sms'] })
  channel: string[];

  @Prop()
  sentAt: Date;

  @Prop()
  readAt?: Date;

  @Prop({ default: false })
  used: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ user_id: 1, status: 1 });
NotificationSchema.index({ user_id: 1, createdAt: -1 });
