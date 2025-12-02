import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTaskCategoryDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}