import { IsString, IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class AskUpdatePasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(12)
  @Matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{12,}$/)
  new_password: string;
}
