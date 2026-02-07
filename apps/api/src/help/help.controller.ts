import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HelpStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@ApiTags('help')
@Controller('api')
export class HelpController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Post('help')
  async create(@Body() body: { conferenceId: string; terminalId?: string; uploadId?: string; message?: string }) {
    const created = await this.prisma.helpRequest.create({ data: { ...body, status: HelpStatus.OPEN } });
    await this.audit.log('HELP_OPEN', 'HelpRequest', created.id, { conferenceId: body.conferenceId });
    return created;
  }

  @Post('admin/help/:id/ack')
  ack(@Param('id') id: string) { return this.prisma.helpRequest.update({ where: { id }, data: { status: HelpStatus.ACK } }); }

  @Post('admin/help/:id/close')
  close(@Param('id') id: string) { return this.prisma.helpRequest.update({ where: { id }, data: { status: HelpStatus.CLOSED } }); }
}
