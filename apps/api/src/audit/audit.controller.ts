import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('audit')
@Controller('api/admin/audit')
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query('conferenceId') conferenceId?: string) {
    return this.prisma.auditLog.findMany({
      where: conferenceId ? { metaJson: { path: ['conferenceId'], equals: conferenceId } } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
