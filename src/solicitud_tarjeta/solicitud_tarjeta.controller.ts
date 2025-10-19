import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, ParseIntPipe, Req, ForbiddenException } from '@nestjs/common';
import { SolicitudTarjetaService } from './solicitud_tarjeta.service';
import { CreateSolicitudTarjetaDto } from './dto/create-solicitud_tarjeta.dto';
import { UpdateSolicitudTarjetaDto } from './dto/update-solicitud_tarjeta.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('solicitud-tarjeta')
export class SolicitudTarjetaController {
  constructor(private readonly solicitudTarjetaService: SolicitudTarjetaService) {}

  @Roles(Role.CIUDADANO, Role.MEDICO)
  @Post()
  create(@Body() createSolicitudTarjetaDto: CreateSolicitudTarjetaDto) {
    return this.solicitudTarjetaService.create(createSolicitudTarjetaDto);
  }
  @Roles(Role.ADMINISTRADOR, Role.CONSULTOR, Role.MEDICO)
  @Get()
  findAll() {
    return this.solicitudTarjetaService.findAll();
  }

  @Roles(Role.CIUDADANO, Role.MEDICO, Role.CONSULTOR)
  @Get(':id_solicitud')
  findOne(@Param('id_solicitud') id_solicitud: number) {
    return this.solicitudTarjetaService.findOne(Number(id_solicitud));
  }

  @Roles(Role.ADMINISTRADOR, Role.MEDICO)
  @Put(':id_solicitud')
  update(@Param('id_solicitud') id_solicitud: number, @Body() updateSolicitudTarjetaDto: UpdateSolicitudTarjetaDto) {
    return this.solicitudTarjetaService.update(Number(id_solicitud), updateSolicitudTarjetaDto);
  }

  @Roles(Role.ADMINISTRADOR, Role.MEDICO)
  @Delete(':id_solicitud')
  remove(@Param('id_solicitud') id_solicitud: number) {
    return this.solicitudTarjetaService.remove(Number(id_solicitud));
  }

  @Roles(Role.ADMINISTRADOR, Role.CONSULTOR, Role.MEDICO, Role.CIUDADANO)
  @Get('usuario/:id_usuario')
  async findByUsuario(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Req() req,
  ) {
    const requester = req.user;
    // Si el solicitante es ciudadano, solo puede consultar sus propias solicitudes
    const isCiudadano = requester && (requester.id_rol === Role.CIUDADANO || (Array.isArray(requester.roles) && requester.roles.includes(Role.CIUDADANO)));
    if (isCiudadano && Number(requester.id_usuario) !== Number(id_usuario)) {
      throw new ForbiddenException('Permiso denegado');
    }
    return this.solicitudTarjetaService.findByUsuario(Number(id_usuario));
  }
}
