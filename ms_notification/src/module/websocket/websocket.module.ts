import { Module } from '@nestjs/common';
// import { NotificationModule } from '../notification/notification.module';
import { WebsocketGateway } from './websocket.gateway';
import { NotificationSchema } from '../../core/schema/notification.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
    ]),
  ],
  providers: [WebsocketGateway],
})
export class WebsocketModule {}
