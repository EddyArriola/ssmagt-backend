import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSolicitudTarjetaDto } from './dto/create-solicitud_tarjeta.dto';
import { UpdateSolicitudTarjetaDto } from './dto/update-solicitud_tarjeta.dto';

@Injectable()
export class SolicitudTarjetaService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSolicitudTarjetaDto) {
    return this.prisma.solicitud_tarjeta.create({ data });
  }

  async findAll() {
    return this.prisma.solicitud_tarjeta.findMany();
  }

  async findOne(id_solicitud: number) {
    return this.prisma.solicitud_tarjeta.findUnique({ where: { id_solicitud } });
  }

  async update(id_solicitud: number, data: UpdateSolicitudTarjetaDto) {
    return this.prisma.solicitud_tarjeta.update({ where: { id_solicitud }, data });
  }

  async remove(id_solicitud: number) {
    return this.prisma.solicitud_tarjeta.delete({ where: { id_solicitud } });
  }

  // Buscar solicitudes por el campo `id_ciudadano` (se recibe id_usuario y se normaliza a número)
  async findByUsuario(id_usuario: number) {
    return this.prisma.solicitud_tarjeta.findMany({
      where: { id_ciudadano: Number(id_usuario) },
    });
  }
}
