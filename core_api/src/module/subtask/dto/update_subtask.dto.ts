import { PartialType } from '@nestjs/mapped-types';
import { CreateSubtaskDto } from './create_subtask.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSubtaskDto extends PartialType(CreateSubtaskDto) {
  @IsBoolean()
  @IsOptional()
  is_done?: boolean;
}
