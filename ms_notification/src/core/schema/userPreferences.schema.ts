import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserPreferences extends Document {
  @Prop({ required: true, index: true, unique: true, lowercase: true })
  user_id: string;

  @Prop({ required: true, index: true, unique: true })
  email: string;

  @Prop({ default: null })
  phone_number: string;

  @Prop({
    type: Map,
    of: Boolean,
    default: {
      inapp: true,
      email: false,
      push: false,
      sms: false,
    },
  })
  channel_preferences: Map<string, boolean>;
}

export const UserPreferencesSchema =
  SchemaFactory.createForClass(UserPreferences);
