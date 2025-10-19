import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInstitutoDto } from './dto/create-instituto.dto';
import { UpdateInstitutoDto } from './dto/update-instituto.dto';

@Injectable()
export class InstitutoService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateInstitutoDto) {
    return this.prisma.instituto.create({ data });
  }

  async findAll() {
    return this.prisma.instituto.findMany();
  }

  async findOne(id_centro: number) {
    return this.prisma.instituto.findUnique({ where: { id_centro } });
  }

  async update(id_centro: number, data: UpdateInstitutoDto) {
    return this.prisma.instituto.update({ where: { id_centro }, data });
  }

  async remove(id_centro: number) {
    return this.prisma.instituto.delete({ where: { id_centro } });
  }
}
