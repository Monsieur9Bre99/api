import { IsNotEmpty, IsString } from "class-validator";

export class CreateSubtaskDto {
    @IsString()
    @IsNotEmpty()
    description: string;
}
