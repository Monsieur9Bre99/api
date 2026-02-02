import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
// import { NotificationService } from '../notification/notification.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class WebsocketGateway {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebsocketGateway.name);
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
  ) {}

  @SubscribeMessage('joinUser')
  async handleJoin(client: Socket, userId: string) {
    await client.join(userId);
    this.logger.log(`User ${userId} joined room`);
  }

  @SubscribeMessage('leaveUser')
  async handleLeave(client: Socket, userId: string) {
    await client.leave(userId);
  }

  @SubscribeMessage('notificationRead')
  async handleNotificationRead(
    @MessageBody() data: { notificationId: string; userId: string },
  ) {
    await this.notificationModel.updateOne(
      { _id: data.notificationId, user_id: data.userId },
      { $set: { status: 'read', readAt: new Date() } },
    );

    this.server.to(data.userId).emit('notificationRead', data.notificationId);
  }

  @SubscribeMessage('notificationUsed')
  async handleNotificationUsed(
    @MessageBody() data: { notificationId: string; userId: string },
  ) {
    await this.notificationModel.updateOne(
      { _id: data.notificationId, user_id: data.userId },
      { $set: { used: true } },
    );

    this.server.to(data.userId).emit('notificationUsed', data.notificationId);
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@MessageBody() userId: string) {
    await this.notificationModel.updateMany(
      { user_id: userId, status: 'sent' },
      { $set: { status: 'read', readAt: new Date() } },
    );

    this.server.to(userId).emit('markAllAsRead');
  }
}
