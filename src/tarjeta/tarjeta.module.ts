import { Module } from '@nestjs/common';
import { TarjetaService } from './tarjeta.service';
import { TarjetaController } from './tarjeta.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TarjetaController],
  providers: [TarjetaService],
})
export class TarjetaModule {}
