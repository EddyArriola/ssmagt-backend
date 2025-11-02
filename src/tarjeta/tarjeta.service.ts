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

  // Buscar todas las tarjetas asociadas a un usuario (a través de las solicitudes)
  // Incluye datos de la solicitud y del usuario solicitante
  async findByUsuario(id_usuario: number) {
    const id = Number(id_usuario);

    // Obtener ids de solicitud asociados al ciudadano
    const solicitudes = await this.prisma.solicitud_tarjeta.findMany({
      where: { id_ciudadano: id },
      select: { id_solicitud: true },
    });

    const solicitudIds = solicitudes.map(s => s.id_solicitud);
    if (solicitudIds.length === 0) return [];

    return this.prisma.tarjeta.findMany({
      where: {
        id_solicitud: { in: solicitudIds },
      },
      // Incluir datos de la solicitud relacionada y del usuario solicitante
      include: {
        solicitud_tarjeta: {
          select: {
            id_centro_de_salud: true,
            id_ciudadano: true,
            fecha_solicitud: true,
            tipo_tarjeta: true,
            estado: true,
            observaciones: true,
            fecha_capacitacion: true,
            examen_medico: true,
            // Incluir datos del usuario solicitante (ciudadano)
            usuario: {
              select: {
                nombres: true,
                apellidos: true,
                cui: true,
                email: true,
                telefono: true,
              }
            }
          }
        }
      },
      orderBy: {
        fecha_emision: 'desc', // más recientes primero
      },
    });
  }

  // Nuevo: buscar todas las tarjetas por centro de salud
  // Busca a través de la relación con solicitud_tarjeta
  // (Se actualizó para incluir los mismos datos de solicitud y usuario solicitante que findByUsuario)
  async findByCentroSalud(id_centro_de_salud: number) {
    const id = Number(id_centro_de_salud);

    // Obtener ids de solicitud asociados al centro de salud
    const solicitudes = await this.prisma.solicitud_tarjeta.findMany({
      where: { id_centro_de_salud: id },
      select: { id_solicitud: true },
    });

    const solicitudIds = solicitudes.map(s => s.id_solicitud);
    if (solicitudIds.length === 0) return [];

    // Buscar tarjetas que referencian esas solicitudes
    return this.prisma.tarjeta.findMany({
      where: {
        id_solicitud: { in: solicitudIds },
      },
      // Incluir datos de la solicitud relacionada y del usuario solicitante (mismos campos que en findByUsuario)
      include: {
        solicitud_tarjeta: {
          select: {
            id_centro_de_salud: true,
            id_ciudadano: true,
            fecha_solicitud: true,
            tipo_tarjeta: true,
            estado: true,
            observaciones: true,
            fecha_capacitacion: true,
            examen_medico: true,
            usuario: {
              select: {
                nombres: true,
                apellidos: true,
                cui: true,
                email: true,
                telefono: true,
              }
            }
          }
        }
      },
      orderBy: {
        fecha_emision: 'desc', // más recientes primero
      },
    });
  }
}
