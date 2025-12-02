import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenCleanupService } from './tokenClean.service';

@Module({
  controllers: [],
  providers: [TokenService, TokenCleanupService],
  exports: [TokenService, TokenCleanupService],
})
export class TokenModule {}
