import { Module } from '@nestjs/common';
import { InstitutoService } from './instituto.service';
import { InstitutoController } from './instituto.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InstitutoController],
  providers: [InstitutoService],
})
export class InstitutoModule {}
