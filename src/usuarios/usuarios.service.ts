import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  findByEmail(_email: string) {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    // Verifica si el usuario ya existe por CUI o email
    const existe = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { cui: createUsuarioDto.cui },
          { email: createUsuarioDto.email }
        ]
      }
    });
    if (existe) throw new BadRequestException('El usuario ya existe');

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    // Asignación de rol y creación de usuario
    const { password, id_rol, ...rest } = createUsuarioDto;
    return this.prisma.usuario.create({
      data: {
        ...rest,
        password: hashedPassword,
        // Si tu modelo tiene un campo diferente para la contraseña, usa ese nombre aquí
        // Por ejemplo: hashed_password: hashedPassword,
        rol: { connect: { id_rol: id_rol } }
      }
    });
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      include: { rol: true }
    });
  }

  async findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id_usuario: id },
      include: { rol: true }
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    let data: any = { ...updateUsuarioDto };
    if (updateUsuarioDto.password) {
      data.password = await bcrypt.hash(updateUsuarioDto.password, 10);
    }
    if (updateUsuarioDto.id_rol) {
      data.Rol = { connect: { id_rol: updateUsuarioDto.id_rol } };
      delete data.id_rol;
    }
    return this.prisma.usuario.update({
      where: { id_usuario: id },
      data,
      include: { rol: true }
    });
  }

  async remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id_usuario: id }
    });
  }

  
  async findByCui(cui: string) {
    const normalized = String(cui).trim();
    console.log('[UsuariosService] buscando CUI:', normalized);
    return this.prisma.usuario.findUnique({ where: { cui: normalized } });
  }
}