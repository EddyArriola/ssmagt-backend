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

    // Hash de la contraseñas
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);

    // Asignación de rol y creación de usuario
    const { password, id_rol, instituto, ...rest } = createUsuarioDto;
    return this.prisma.usuario.create({
      data: {
        ...rest,
        password: hashedPassword,
        id_rol: id_rol,
        instituto: instituto
        // Si tu modelo tiene un campo diferente para la contraseña, usa ese nombre aquí
        // Por ejemplo: hashed_password: hashedPassword,
      }
    });
  }

  async createSimple(createUsuarioDto: CreateUsuarioDto) {
    const hashedPassword = await bcrypt.hash(createUsuarioDto.password, 10);
    
    const data = {
      ...createUsuarioDto,
      password: hashedPassword,
      instituto: createUsuarioDto.instituto, // ✅ Campo directo
      // NO usar: Instituto: { connect: { ... } } // ❌ Relación
    };

    return this.prisma.usuario.create({ data });
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
    // Crear copia de los datos sin campos problemáticos
    const { id_usuario, ...data } = updateUsuarioDto as any;

    // Hash de la contraseña si viene en el update
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      // Si no hay password, eliminar el campo undefined
      delete data.password;
    }

    // Manejar id_rol: usar campo directo, NO relación
    if (updateUsuarioDto.id_rol !== undefined) {
      data.id_rol = updateUsuarioDto.id_rol;
      // NO crear relación rol si usas campo directo
    }

    // Manejar instituto: usar campo directo, NO relación
    if (updateUsuarioDto.instituto !== undefined) {
      data.instituto = updateUsuarioDto.instituto;
      // NO crear relación Instituto si usas campo directo
    }

    // Limpiar campos que no deben estar
    delete data.id_usuario;

    return this.prisma.usuario.update({
      where: {
        id_usuario: id
      },
      data,
      include: {
        rol: true
      }
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