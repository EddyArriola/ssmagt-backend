import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true; // no roles required

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new UnauthorizedException();

    // soporta user.roles (array) o user.id_rol (número)
    const userRoles = Array.isArray(user.roles)
      ? user.roles
      : user.id_rol != null
      ? [user.id_rol]
      : [];

    const ok = requiredRoles.some(role => userRoles.includes(role));
    if (!ok) throw new ForbiddenException('Permisos insuficientes');
    return true;
  }
}