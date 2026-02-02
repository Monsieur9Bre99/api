import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from '../../core/schema/notification.schema';
import { Model } from 'mongoose';
import {
  iNotification,
  iUserPreferences,
  iTemplate,
} from '../../core/interface/interface';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  private renderTemplate(
    templateString: string,
    payload: Record<string, any>,
  ): string {
    return Object.entries(payload).reduce((result, [key, value]) => {
      const placeholder = `{{payload.${key}}}`;
      return result.replace(
        new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        String(value),
      );
    }, templateString);
  }

  async findAll(user_id: string): Promise<iNotification[]> {
    return this.notificationModel
      .find({ user_id: user_id })
      .select({
        _id: 1,
        category: 1,
        title: 1,
        content: 1,
        payload: 1,
        status: 1,
        sentAt: 1,
        readAt: 1,
        channel: 1,
        used: 1,
      })
      .sort({ sentAt: -1 })
      .limit(50)
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<iNotification | null> {
    return this.notificationModel.findById(id).select({
      _id: 1,
      category: 1,
      title: 1,
      content: 1,
      payload: 1,
      status: 1,
      sentAt: 1,
      readAt: 1,
      channel: 1,
      used: 1,
    });
  }

  async create(data: {
    user: iUserPreferences;
    template: iTemplate;
    variables: any;
  }): Promise<Notification> {
    const supportedChannels = ['inapp', 'email', 'push', 'sms'];

    const channelPrefs = data.user.channel_preferences as unknown as Record<
      string,
      boolean
    >;

    const channels = Object.keys(channelPrefs).filter(
      (channel) =>
        channelPrefs[channel] === true && supportedChannels.includes(channel),
    );
    const notificationData = new this.notificationModel({
      user_id: data.user.user_id,
      category: data.template.category,
      template_id: data.template._id,
      title: this.renderTemplate(data.template.title, data.variables),
      content: this.renderTemplate(data.template.content, data.variables),
      payload: data.variables,
      status: 'pending',
      channel: channels,
    });

    const notification = await notificationData.save();

    return notification;
  }

  async dispatch(notification: Notification): Promise<Notification> {
    await this.notificationModel.updateOne(
      { _id: notification._id },
      { $set: { status: 'sent', sentAt: new Date() } },
    );

    if (notification.channel.includes('inapp')) {
      this.websocketGateway.server
        .to(notification.user_id)
        .emit('notificationUpdated', notification);
    }
    if (notification.channel.includes('email')) {
      //  TODO : implementation de l'envoi de notification par email
    }
    if (notification.channel.includes('push')) {
      //  TODO : implementation de l'envoi de notification par notif push
    }
    if (notification.channel.includes('sms')) {
      //  TODO : implementation de l'envoi de notification par sms
    }

    return notification;
  }

  async delete(id: string): Promise<iNotification | null> {
    return this.notificationModel.findByIdAndDelete({ _id: id });
  }
}
