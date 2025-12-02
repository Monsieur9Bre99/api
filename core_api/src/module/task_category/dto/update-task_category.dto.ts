import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateTaskCategoryDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;
}
