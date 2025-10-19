import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { InstitutoService } from './instituto.service';
import { CreateInstitutoDto } from './dto/create-instituto.dto';
import { UpdateInstitutoDto } from './dto/update-instituto.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('instituto')
export class InstitutoController {
  constructor(private readonly institutoService: InstitutoService) {}

  @Roles(Role.ADMINISTRADOR)
  @Post()
  create(@Body() createInstitutoDto: CreateInstitutoDto) {
    return this.institutoService.create(createInstitutoDto);
  }

  @Roles(Role.ADMINISTRADOR, Role.CONSULTOR)
  @Get()
  findAll() {
    return this.institutoService.findAll();
  }

  @Roles(Role.ADMINISTRADOR)
  @Get(':id_instituto')
  findOne(@Param('id_instituto') id_instituto: number) {
    return this.institutoService.findOne(Number(id_instituto));
  }

  @Roles(Role.ADMINISTRADOR)
  @Put(':id_instituto')
  update(@Param('id_instituto') id_instituto: number, @Body() updateInstitutoDto: UpdateInstitutoDto) {
    return this.institutoService.update(Number(id_instituto), updateInstitutoDto);
  }

  @Roles(Role.ADMINISTRADOR)
  @Delete(':id_instituto')
  remove(@Param('id_instituto') id_instituto: number) {
    return this.institutoService.remove(Number(id_instituto));
  }
}
