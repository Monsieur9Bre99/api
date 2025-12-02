import { forwardRef, Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthentificationModule } from '../authentification/authentification.module';

@Module({
  imports: [JwtModule, forwardRef(() => AuthentificationModule)],
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
