import { forwardRef, Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthentificationModule } from '../authentification/authentification.module';
import { MemberModule } from '../member/member.module';

@Module({
  imports: [
    JwtModule,
    forwardRef(() => AuthentificationModule),
    forwardRef(() => MemberModule),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
