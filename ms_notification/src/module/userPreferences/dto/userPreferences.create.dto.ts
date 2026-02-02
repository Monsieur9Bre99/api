import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserPreferencesCreateDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
