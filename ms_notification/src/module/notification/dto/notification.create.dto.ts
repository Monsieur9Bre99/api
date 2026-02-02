import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class NotificationCreateDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsObject()
  @IsNotEmpty()
  variables: Record<string, any>;
}
