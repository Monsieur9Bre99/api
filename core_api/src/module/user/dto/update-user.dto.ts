import { PartialType } from '@nestjs/mapped-types';
import { UserCreateDto } from './createUser.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(UserCreateDto) {
  @IsBoolean()
  @IsOptional()
  is_confirmed?: boolean;
}
