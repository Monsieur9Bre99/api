import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthentificationModule } from '../authentification/authentification.module';
import { TaskCategoryService } from './task_category.service';
import { TaskCategoryController } from './task_category.controller';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [JwtModule, forwardRef(() => AuthentificationModule), MemberModule],
  controllers: [TaskCategoryController],
  providers: [TaskCategoryService],
  exports: [TaskCategoryService],
})
export class TaskCategoryModule {}
