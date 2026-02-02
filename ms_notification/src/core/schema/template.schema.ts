import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true  })
export class Template extends Document {
  @Prop({ required: true, index: true, unique: true })
  category: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: mongoose.Schema.Types.Mixed, default: {} })
  payload: Record<string, any>;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
