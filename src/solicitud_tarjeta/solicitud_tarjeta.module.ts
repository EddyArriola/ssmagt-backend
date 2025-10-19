import { Module } from '@nestjs/common';
import { SolicitudTarjetaService } from './solicitud_tarjeta.service';
import { SolicitudTarjetaController } from './solicitud_tarjeta.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SolicitudTarjetaController],
  providers: [SolicitudTarjetaService],
})
export class SolicitudTarjetaModule {}
