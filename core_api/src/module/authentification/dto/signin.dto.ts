import {
	IsString,
	IsEmail,
	IsNotEmpty,
	MinLength,
	IsOptional,
	IsBoolean,
} from 'class-validator';

export class SigninDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@MinLength(12)
	@IsNotEmpty()
	password: string;

	@IsOptional()
	@IsBoolean()
	rememberMe?: boolean;
}
