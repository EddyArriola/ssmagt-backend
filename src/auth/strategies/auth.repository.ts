import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUsuarioDto } from '../../usuarios/dto/create-usuario.dto';

// Reemplaza el repositorio en memoria por consultas reales a la BD vía Prisma
@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Buscar usuario por CUI en la base de datos (normaliza el CUI)
  async findByCui(cui: string) {
    const normalized = cui != null ? String(cui).trim() : '';
    // use findUnique si 'cui' es unique en el schema, sino usar findFirst
    return this.prisma.usuario.findUnique({ where: { cui: normalized } });
  }

  // Buscar por id (se asume que la PK se llama id_usuario en Prisma)
  async findById(id: number) {
    return this.prisma.usuario.findUnique({ where: { id_usuario: Number(id) } });
  }

  // Crear usuario en la BD usando Prisma (asegúrate que campos coincidan con el schema)
  async create(createUsuarioDto: CreateUsuarioDto) {
    const data = {
      ...createUsuarioDto,
      fecha_nacimiento: createUsuarioDto.fecha_nacimiento ? new Date(createUsuarioDto.fecha_nacimiento) : undefined,
    };
    return this.prisma.usuario.create({ data });
  }
}