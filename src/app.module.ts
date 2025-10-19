import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AreaModule } from './area/area.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { InstitutoModule } from './instituto/instituto.module';
import { SolicitudTarjetaModule } from './solicitud_tarjeta/solicitud_tarjeta.module';
import { TarjetaModule } from './tarjeta/tarjeta.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsuariosModule,
    AreaModule,
    AuthModule,
    InstitutoModule,
    SolicitudTarjetaModule,
    TarjetaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
