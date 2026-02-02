import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from '../../core/schema/notification.schema';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { TemplateModule } from '../template/template.module';
import { UserPreferencesModule } from '../userPreferences/userPreferences.module';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
    ]),
    TemplateModule,
    UserPreferencesModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService, WebsocketGateway],
  exports: [NotificationService],
})
export class NotificationModule {}
