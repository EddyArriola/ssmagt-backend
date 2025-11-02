import { IsString, IsEmail, IsOptional, IsDate, IsInt, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUsuarioDto {
  @IsOptional()
  @IsInt()
  id_rol?: number;

  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsString()
  cui: string;

  @Type(() => Date)
  @IsDate()
  fecha_nacimiento: Date;

  @IsOptional()
  @IsString()
  direccion?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  ocupacion?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsInt()
  instituto?: number; // ✅ Campo directo (minúscula)
}