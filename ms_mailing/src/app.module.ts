import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TemplateModule } from './module/template/template.module';
import { MailerModule } from './module/mailer/mailer.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    TemplateModule,
    MailerModule,
  ],
})
export class AppModule {}
