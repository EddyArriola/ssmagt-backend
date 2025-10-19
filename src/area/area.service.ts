import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreaService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAreaDto) {
    return this.prisma.area.create({ data });
  }

  async findAll() {
    return this.prisma.area.findMany();
  }

  async findOne(id_area: number) {
    return this.prisma.area.findUnique({ where: { id_area } });
  }

  async update(id_area: number, data: UpdateAreaDto) {
    return this.prisma.area.update({ where: { id_area }, data });
  }

  async remove(id_area: number) {
    return this.prisma.area.delete({ where: { id_area } });
  }
}
