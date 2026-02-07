import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('webhooks')
@Controller('api/admin/webhooks')
export class WebhooksController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query('conferenceId') conferenceId: string) { return this.prisma.webhook.findMany({ where: { conferenceId } }); }
  @Post()
  create(@Body() body: any) { return this.prisma.webhook.create({ data: body }); }
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.prisma.webhook.update({ where: { id }, data: body }); }
  @Delete(':id')
  remove(@Param('id') id: string) { return this.prisma.webhook.delete({ where: { id } }); }
}
