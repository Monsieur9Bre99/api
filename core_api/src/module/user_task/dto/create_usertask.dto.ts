import { IsNotEmpty, IsString } from "class-validator";

export class CreateUsertaskDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;
}
