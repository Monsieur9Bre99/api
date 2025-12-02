import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthentificationModule } from '../authentification/authentification.module';
import { MemberModule } from '../member/member.module';
import { UserTaskController } from './user_task.controller';
import { UserTaskService } from './user_task.service';

@Module({
  imports: [JwtModule, forwardRef(() => AuthentificationModule), MemberModule],
  controllers: [UserTaskController],
  providers: [UserTaskService],
  exports: [UserTaskService],
})
export class UserTaskModule {}
