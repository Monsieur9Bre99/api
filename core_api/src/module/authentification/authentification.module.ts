import { forwardRef, Module } from '@nestjs/common';
import { AuthentificationService } from './authentification.service';
import { AuthentificationController } from './authentification.controller';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from '../token/token.module';
import { UserModule } from '../user/user.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [JwtModule, TokenModule, forwardRef(() => UserModule), EventModule],
  controllers: [AuthentificationController],
  providers: [AuthentificationService],
  exports: [AuthentificationService],
})
export class AuthentificationModule {}
