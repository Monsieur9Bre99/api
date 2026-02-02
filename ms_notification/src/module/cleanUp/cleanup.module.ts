import { Module } from '@nestjs/common';
import { CleanupService } from './cleanup.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from '../../core/schema/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
    ]),
  ],
  providers: [CleanupService],
})
export class CleanupModule {}
