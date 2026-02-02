import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthentificationModule } from '../authentification/authentification.module';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    JwtModule,
    forwardRef(() => AuthentificationModule),
    forwardRef(() => EventModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
