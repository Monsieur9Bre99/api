import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class TemplateUpdateDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsObject()
  @IsOptional()
  payload: Record<string, any>;
}
