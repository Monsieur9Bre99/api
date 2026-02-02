import { TaskPriority } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskPriority)
  @IsString()
  priority: TaskPriority;

  @IsString()
  @IsOptional()
  image?: string;

  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  delay: number;

  @IsString()
  @IsNotEmpty()
  task_category_id: string;
}

export class CreateTaskPayload extends CreateTaskDto {
  @IsNotEmpty()
  @Transform(({ value }) => JSON.parse(value || '[]'))
  users: string | string[];

  @IsOptional()
  @Transform(({ value }) => JSON.parse(value || '[]'))
  subtasks?: string | string[];
}
