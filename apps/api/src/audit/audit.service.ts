import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  log(action: string, entity: string, entityId: string, metaJson: Record<string, unknown> = {}) {
    return this.prisma.auditLog.create({ data: { action, entity, entityId, metaJson } });
  }
}
