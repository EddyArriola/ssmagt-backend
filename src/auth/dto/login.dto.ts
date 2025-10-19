import { IsString, IsNotEmpty } from 'class-validator';

export class LoginUsuarioDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    
}