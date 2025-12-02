import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthentificationModule } from '../authentification/authentification.module';
import { MemberModule } from '../member/member.module';
import { SubtaskController } from './subtask.controller';
import { SubtaskService } from './subtask.service';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [
    JwtModule,
    forwardRef(() => AuthentificationModule),
    MemberModule,
    TaskModule,
  ],
  controllers: [SubtaskController],
  providers: [SubtaskService],
  exports: [SubtaskService],
})
export class SubtaskModule {}
