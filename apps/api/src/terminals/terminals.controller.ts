import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@ApiTags('terminals')
@Controller('api')
export class TerminalsController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Post('terminals/heartbeat')
  async heartbeat(@Body() body: { terminalId: string; version: string; diskFree: number; status: string }) {
    return this.prisma.terminal.update({ where: { id: body.terminalId }, data: { version: body.version, diskFree: body.diskFree, status: body.status, lastSeenAt: new Date() } });
  }

  @Get('admin/terminals')
  list() { return this.prisma.terminal.findMany({ orderBy: { lastSeenAt: 'desc' } }); }

  @Post('admin/terminals/:id/lock')
  async lock(@Param('id') id: string) { await this.audit.log('TERMINAL_LOCK', 'Terminal', id); return this.prisma.terminal.update({ where: { id }, data: { isLocked: true } }); }

  @Post('admin/terminals/:id/unlock')
  async unlock(@Param('id') id: string) { await this.audit.log('TERMINAL_UNLOCK', 'Terminal', id); return this.prisma.terminal.update({ where: { id }, data: { isLocked: false } }); }

  @Post('admin/terminals/:id/clear-cache')
  clearCache(@Param('id') id: string) { return this.audit.log('TERMINAL_CLEAR_CACHE_STUB', 'Terminal', id); }

  @Post('admin/terminals/:id/download-logs')
  downloadLogs(@Param('id') id: string) { return this.audit.log('TERMINAL_DOWNLOAD_LOGS_STUB', 'Terminal', id); }
}
