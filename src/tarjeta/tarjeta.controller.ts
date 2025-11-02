import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { TarjetaService } from './tarjeta.service';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tarjeta')
export class TarjetaController {
  constructor(private readonly tarjetaService: TarjetaService) {}

  @Roles(Role.ADMINISTRADOR, Role.MEDICO)
  @Post()
  create(@Body() createTarjetaDto: CreateTarjetaDto) {
    return this.tarjetaService.create(createTarjetaDto);
  }
  @Roles(Role.ADMINISTRADOR, Role.MEDICO)
  @Get()
  findAll() {
    return this.tarjetaService.findAll();
  }
  @Roles(Role.ADMINISTRADOR, Role.MEDICO)
  @Get(':id_tarjeta')
  findOne(@Param('id_tarjeta') id_tarjeta: number) {
    return this.tarjetaService.findOne(Number(id_tarjeta));
  }
  @Roles(Role.ADMINISTRADOR, Role.MEDICO)
  @Put(':id_tarjeta')
  update(@Param('id_tarjeta') id_tarjeta: number, @Body() updateTarjetaDto: UpdateTarjetaDto) {
    return this.tarjetaService.update(Number(id_tarjeta), updateTarjetaDto);
  }
  @Roles(Role.ADMINISTRADOR, Role.MEDICO)
  @Delete(':id_tarjeta')
  remove(@Param('id_tarjeta') id_tarjeta: number) {
    return this.tarjetaService.remove(Number(id_tarjeta));
  }

  @Roles(Role.ADMINISTRADOR, Role.CONSULTOR, Role.MEDICO, Role.CIUDADANO)
  @Get('usuario/:id_usuario')
  async findByUsuario(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Request() req,
  ) {
    const requester = req.user;
    const isCiudadano = requester && (requester.id_rol === Role.CIUDADANO || (Array.isArray(requester.roles) && requester.roles.includes(Role.CIUDADANO)));
    if (isCiudadano && Number(requester.id_usuario) !== Number(id_usuario)) {
      throw new ForbiddenException('Permiso denegado');
    }
    return this.tarjetaService.findByUsuario(Number(id_usuario));
  }

  @Roles(Role.ADMINISTRADOR, Role.MEDICO, Role.CONSULTOR)
  @Get('centro/:id_centro')
  async findByCentroSalud(
    @Param('id_centro', ParseIntPipe) id_centro: number,
  ) {
    return this.tarjetaService.findByCentroSalud(Number(id_centro));
  }
}
