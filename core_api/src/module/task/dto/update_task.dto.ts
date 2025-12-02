import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto, CreateTaskPayload } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}

export class UpdateTaskPayload extends PartialType(CreateTaskPayload) {}
