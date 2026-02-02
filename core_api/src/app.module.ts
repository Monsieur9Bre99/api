import { Module } from '@nestjs/common';
import { UserModule } from './module/user/user.module';
import { AuthentificationModule } from './module/authentification/authentification.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ProjectModule } from './module/project/project.module';
import { MemberModule } from './module/member/member.module';
import { TokenModule } from './module/token/token.module';
import { EventModule } from './module/event/event.module';
import { ConfigModule } from '@nestjs/config';
import { TaskCategoryModule } from './module/task_category/task_category.module';
import { TaskModule } from './module/task/task.module';
import { SubtaskModule } from './module/subtask/subtask.module';
import { UserTaskModule } from './module/user_task/user_task.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    EventModule,
    PrismaModule,
    AuthentificationModule,
    MemberModule,
    UserModule,
    ProjectModule,
    TaskCategoryModule,
    TaskModule,
    UserTaskModule,
    SubtaskModule,
    TokenModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
