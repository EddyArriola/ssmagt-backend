import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Roles(Role.ADMINISTRADOR)
  @Post()
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areaService.create(createAreaDto);
  }
  @Roles(Role.ADMINISTRADOR, Role.CONSULTOR)
  @Get()
  findAll() {
    return this.areaService.findAll();
  }
  @Roles(Role.ADMINISTRADOR)
  @Get(':id_area')
  findOne(@Param('id_area') id_area: number) {
    return this.areaService.findOne(Number(id_area));
  }

  @Roles(Role.ADMINISTRADOR)
  @Put(':id_area')
  update(@Param('id_area') id_area: number, @Body() updateAreaDto: UpdateAreaDto) {
    return this.areaService.update(Number(id_area), updateAreaDto);
  }

  @Roles(Role.ADMINISTRADOR)
  @Delete(':id_area')
  remove(@Param('id_area') id_area: number) {
    return this.areaService.remove(Number(id_area));
  }
}
