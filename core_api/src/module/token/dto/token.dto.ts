import { TokenType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpsertTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsEnum(TokenType)
  @IsNotEmpty()
  type: TokenType;

  @IsString()
  @IsNotEmpty()
  expires_at: string;
}
