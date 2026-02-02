import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateMailTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  bodyHtml: string;

  @IsString()
  @IsOptional()
  bodyText?: string;

  @IsObject()
  @IsOptional()
  variables?: Record<string, string>;
}

export class createNotificationTemplateDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsObject()
  @IsNotEmpty()
  payload: Record<string, any>;
}
