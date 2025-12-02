import { MemberRole } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsEnum(MemberRole)
  @IsString()
  @IsOptional()
  role?: MemberRole;
}
