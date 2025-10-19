// ...existing code...
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

  // Valida credenciales: busca por CUI y compara hash de contraseña
  async validateUser(cui: string, password: string): Promise<any> {
    const user = await this.usuariosService.findByCui(cui);
    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result; // devuelve usuario sin campo password
    }
    return null;
  }

  // Login: acepta dto con { cui | username, password } y devuelve { access_token }
  async login(dto: LoginUsuarioDto): Promise<{ access_token: string }> {
    // Prioriza 'cui' en el DTO, si no existe usa 'username'
    const credential = (dto as any).cui ?? (dto as any).username;
    const user = await this.validateUser(credential, dto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Normaliza identificador y roles para el payload
    const userId = (user as any).id_usuario ?? (user as any).id ?? null;
    const roles = (user as any).id_rol ?? (user as any).roles ?? null;

    const payload = {
      sub: userId,
      id: userId,
      nombre: (user as any).nombres ?? (user as any).name,
      cui: (user as any).cui,
      email: (user as any).email,
      roles,
    };

    // Genera token usando JwtService configurado en AuthModule
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }
}