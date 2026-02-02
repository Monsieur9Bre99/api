import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class TemplateCreateDto {
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
