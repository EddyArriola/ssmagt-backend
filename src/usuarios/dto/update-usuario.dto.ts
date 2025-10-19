import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsOptional, IsString, MinLength, IsInt } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsInt()
  id_rol?: number;
}