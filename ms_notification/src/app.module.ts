import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from './module/notification/notification.module';
import { TemplateModule } from './module/template/template.module';
import { UserPreferencesModule } from './module/userPreferences/userPreferences.module';
import { WebsocketModule } from './module/websocket/websocket.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupModule } from './module/cleanUp/cleanup.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI as string),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    NotificationModule,
    TemplateModule,
    UserPreferencesModule,
    WebsocketModule,
    CleanupModule,
  ],
})
export class AppModule {}
