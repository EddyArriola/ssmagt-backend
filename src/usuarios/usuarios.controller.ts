import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { usuario } from "@prisma/client";
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // Endpoint público para crear usuario (registro)
  @Post()
  async crearUsuario(@Body() data: CreateUsuarioDto): Promise<usuario> {
    return this.usuariosService.create(data);
  }

  // Aplicar guards solo a los endpoints protegidos
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  getPerfil(@Request() req) {
    return req.user; // contiene id_usuario, email, rol, etc.
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  @Get()
  async getTodos(): Promise<usuario[]> {
    return this.usuariosService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR, Role.MEDICO, Role.CIUDADANO, Role.CONSULTOR)
  @Get(':id')
  async obtenerUno(@Param('id', ParseIntPipe) id: number): Promise<usuario | null> {
    return this.usuariosService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR, Role.CIUDADANO, Role.MEDICO, Role.CONSULTOR)
  @Put(':id')
  async modificarUsuario(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUsuarioDto,
  ): Promise<usuario> {
    return this.usuariosService.update(id, data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  @Delete(':id')
  async eliminarUsuario(@Param('id', ParseIntPipe) id: number): Promise<usuario> {
    return this.usuariosService.remove(id);
  }
}
