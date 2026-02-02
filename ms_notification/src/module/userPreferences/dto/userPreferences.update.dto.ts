import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UserPreferencesUpdateDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone_number?: string;

  @IsObject()
  @IsOptional()
  channel_preferences?: {
    inapp?: boolean;
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}
