import { forwardRef, Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthentificationModule } from '../authentification/authentification.module';
import { EventModule } from '../event/event.module';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    JwtModule,
    forwardRef(() => AuthentificationModule),
    forwardRef(() => ProjectModule),
    forwardRef(() => EventModule),
  ],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
