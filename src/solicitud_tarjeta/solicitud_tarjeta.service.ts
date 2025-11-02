import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSolicitudTarjetaDto } from './dto/create-solicitud_tarjeta.dto';
import { UpdateSolicitudTarjetaDto } from './dto/update-solicitud_tarjeta.dto';

@Injectable()
export class SolicitudTarjetaService {
  constructor(private prisma: PrismaService) {}

  // Al crear una solicitud, establece estado automático como "pendiente" (1)
  async create(data: CreateSolicitudTarjetaDto) {
    const solicitudData = {
      ...data,
      estado: 1, // 1 = pendiente (automático)
    };
    return this.prisma.solicitud_tarjeta.create({ data: solicitudData });
  }

  async findAll() {
    return this.prisma.solicitud_tarjeta.findMany();
  }

  async findOne(id_solicitud: number) {
    return this.prisma.solicitud_tarjeta.findUnique({ where: { id_solicitud } });
  }

  // Al actualizar, si el estado cambia a "aprobado" (2), crea tarjeta automáticamente
  async update(id_solicitud: number, data: UpdateSolicitudTarjetaDto) {
    const solicitudActual = await this.prisma.solicitud_tarjeta.findUnique({
      where: { id_solicitud },
    });

    if (!solicitudActual) {
      throw new Error('Solicitud no encontrada');
    }

    // Actualizar la solicitud
    const solicitudActualizada = await this.prisma.solicitud_tarjeta.update({
      where: { id_solicitud },
      data,
    });

    // Si el estado cambió a "aprobado" (2), crear tarjeta automáticamente
    if (data.estado === 2 && solicitudActual.estado !== 2) {
      await this.crearTarjetaDesdeAprobacion(solicitudActualizada);
    }

    return solicitudActualizada;
  }

  async remove(id_solicitud: number) {
    return this.prisma.solicitud_tarjeta.delete({ where: { id_solicitud } });
  }

  async findByUsuario(id_usuario: number) {
    return this.prisma.solicitud_tarjeta.findMany({
      where: { id_ciudadano: Number(id_usuario) },
    });
  }

  // Nuevo: obtener solicitudes pendientes por centro de salud
  // Útil para que cada centro gestione solo sus solicitudes pendientes
  async findPendientesPorCentro(id_centro_de_salud: number) {
    return this.prisma.solicitud_tarjeta.findMany({
      where: {
        id_centro_de_salud: Number(id_centro_de_salud),
        estado: 1, // 1 = pendiente
      },
      // Opcional: incluir datos relacionados para mostrar más información
      include: {
        // Descomenta si tienes relaciones definidas en Prisma
        // ciudadano: { select: { nombres: true, apellidos: true, cui: true } },
        // centro_de_salud: { select: { nombre: true } },
        // medico: { select: { nombres: true, apellidos: true } },
      },
      orderBy: {
        fecha_solicitud: 'desc', // más recientes primero
      },
    });
  }

  // Método privado para crear tarjeta cuando se aprueba solicitud
  private async crearTarjetaDesdeAprobacion(solicitud: any) {
    const tarjetaData = {
      fecha_emision: new Date(), // fecha actual para emisión
      fecha_vencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año de vigencia
      id_solicitud: solicitud.id_solicitud, // ✅ Campo directo que SÍ existe
      estado: 2, // ✅ Usa 'estado', NO 'id_estado'
    };

    console.log('[Creando tarjeta] datos:', tarjetaData);
    return this.prisma.tarjeta.create({ data: tarjetaData });
  }
}
