import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { Notification } from '../../core/schema/notification.schema';

@Injectable()
export class CleanupService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
  ) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanOldNotifications() {
    const RETENTION_DAYS = process.env.NOTIFICATION_RETENTION_DAYS || '30';

    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - parseInt(RETENTION_DAYS));

    const result = await this.notificationModel.deleteMany({
      createdAt: { $lt: currentDate, status: 'read' },
    });

    console.log(`Suppressions de ${result.deletedCount} notification(s)`);
  }
}
