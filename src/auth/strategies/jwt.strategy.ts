import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
// CORRECCIÓN: ruta relativa correcta al repositorio en la misma carpeta "strategies"
import { AuthRepository } from './auth.repository';
import { ConfigService } from '@nestjs/config';
import { PayLoadInterface } from './payload.interface';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Lee la clave secreta desde ConfigService (o usa valor por defecto)
      secretOrKey: configService.get<string>('JWT_SECRET') || 'TU_SECRETO_JWT',
    });
  }

  // Devuelve un objeto normalizado que será asignado a req.user
  async validate(payload: PayLoadInterface): Promise<any> {
    console.log('[JWT validate] payload:', payload);

    // normalizar CUI
    const cui = payload.cui ? String(payload.cui).trim() : null;

    // intentar buscar por CUI
    let usuario = cui ? await this.authRepository.findByCui(cui) : undefined;

    // si no encuentra por CUI, intentar por id (sub)
    if (!usuario && payload.sub) {
      usuario = await this.authRepository.findById(payload.sub);
    }

    console.log('[JWT validate] usuario encontrado:', !!usuario, usuario);

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // devolver shape esperado por req.user
    return {
      id_usuario: (usuario as any).id_usuario ?? (usuario as any).id ?? payload.sub,
      cui: usuario.cui,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      id_rol: usuario.id_rol,
    };
  }
}