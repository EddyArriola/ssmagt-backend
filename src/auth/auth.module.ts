import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module'; // <-- agregar import

import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AuthController } from './auth.controller';
import { AuthRepository } from './strategies/auth.repository';

@Module({
  imports: [
    ConfigModule,
    PrismaModule, // <-- agregar aquí
    UsuariosModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET no definido en .env');
        return {
          secret,
          signOptions: { expiresIn: '1d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, AuthRepository],
  controllers: [AuthController],
  exports: [AuthService, PassportModule, JwtStrategy],
})
export class AuthModule {}