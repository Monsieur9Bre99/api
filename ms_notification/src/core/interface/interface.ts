import { Types } from 'mongoose';

export interface iNotification {
  _id: Types.ObjectId;
  category: string;
  title: string;
  content?: string | null;
  payload: Record<string, any>;
  status: string;
  sentAt: Date;
  readAt?: Date | null;
  channel: string[];
  used: boolean;
}

export interface iUserPreferences {
  _id: Types.ObjectId;
  user_id: string;
  email: string;
  phone_number?: string | null;
  channel_preferences: Map<string, boolean>;
}

export interface iTemplate {
  _id: Types.ObjectId;
  category: string;
  title: string;
  content: string;
  payload: Record<string, any>;
}
