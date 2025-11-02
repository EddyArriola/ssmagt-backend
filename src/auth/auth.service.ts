import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUsuarioDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async validateUser(cui: string, password: string): Promise<any> {
    const user = await this.usuariosService.findByCui(cui);
    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // Login: incluye el campo instituto en el payload del token
  async login(dto: LoginUsuarioDto): Promise<{ access_token: string }> {
    const credential = (dto as any).cui ?? (dto as any).username;
    const user = await this.validateUser(credential, dto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Normaliza identificador, roles e instituto para el payload
    const userId = (user as any).id_usuario ?? (user as any).id ?? null;
    const roles = (user as any).id_rol ?? (user as any).roles ?? null;
    const instituto = (user as any).instituto ?? null; // campo instituto agregado

    const payload = {
      sub: userId,
      id: userId,
      nombre: (user as any).nombres ?? (user as any).name,
      cui: (user as any).cui,
      email: (user as any).email,
      roles,
      instituto, // nuevo campo en el payload
    };

    const token = await this.jwtService.signAsync(payload);
    return { access_token: token };
  }
}