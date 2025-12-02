import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthentificationModule } from '../authentification/authentification.module';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { MemberModule } from '../member/member.module';
import { TaskCategoryModule } from '../task_category/task_category.module';

@Module({
  imports: [
    JwtModule,
    forwardRef(() => AuthentificationModule),
    MemberModule,
    TaskCategoryModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
