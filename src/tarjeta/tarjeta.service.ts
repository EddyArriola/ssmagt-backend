import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto';

@Injectable()
export class TarjetaService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTarjetaDto) {
    return this.prisma.tarjeta.create({ data });
  }

  async findAll() {
    return this.prisma.tarjeta.findMany();
  }

  async findOne(id_tarjeta: number) {
    return this.prisma.tarjeta.findUnique({ where: { id_tarjeta } });
  }

  async update(id_tarjeta: number, data: UpdateTarjetaDto) {
    return this.prisma.tarjeta.update({ where: { id_tarjeta }, data });
  }

  async remove(id_tarjeta: number) {
    return this.prisma.tarjeta.delete({ where: { id_tarjeta } });
  }

  // Nuevo: buscar todas las tarjetas asociadas a un usuario (a través de las solicitudes)
  // - Busca solicitudes donde id_ciudadano = id_usuario
  // - Luego devuelve tarjetas cuya FK a solicitud (id_solicitud) esté en la lista
  async findByUsuario(id_usuario: number) {
    const id = Number(id_usuario);

    // Obtener ids de solicitud asociados al ciudadano
    const solicitudes = await this.prisma.solicitud_tarjeta.findMany({
      where: { id_ciudadano: id },
      select: { id_solicitud: true },
    });

    const solicitudIds = solicitudes.map(s => s.id_solicitud);
    if (solicitudIds.length === 0) return [];

    // Buscar tarjetas que referencian esas solicitudes.
    // Si en tu esquema la FK en tarjeta tiene otro nombre, ajusta 'id_solicitud' abajo.
    return this.prisma.tarjeta.findMany({
      where: {
        id_solicitud: { in: solicitudIds },
      },
    });
  }
}
