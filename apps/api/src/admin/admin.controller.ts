import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@ApiTags('admin')
@Controller('api/admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  @Get('dashboard')
  async dashboard(@Query('conferenceId') conferenceId: string) {
    const uploads = await this.prisma.upload.findMany({ where: { conferenceId }, orderBy: { createdAt: 'desc' }, take: 20 });
    return {
      today: uploads.length,
      total: await this.prisma.upload.count({ where: { conferenceId } }),
      problematic: uploads.filter((u) => ['REJECTED', 'ERROR', 'NEEDS_MATCH'].includes(u.status)).length,
      latest: uploads,
    };
  }

  @Get('uploads')
  list(@Query('conferenceId') conferenceId: string, @Query('status') status?: string) {
    return this.prisma.upload.findMany({ where: { conferenceId, ...(status ? { status: status as any } : {}) }, include: { files: true } });
  }

  @Get('uploads/:id')
  get(@Param('id') id: string) { return this.prisma.upload.findUnique({ where: { id }, include: { files: true } }); }

  @Post('uploads/:id/mark-current')
  async markCurrent(@Param('id') id: string, @Body() body: { fileId: string }) {
    const files = await this.prisma.uploadFile.findMany({ where: { uploadId: id } });
    await Promise.all(files.map((f) => this.prisma.uploadFile.update({ where: { id: f.id }, data: { isCurrent: f.id === body.fileId } })));
    await this.audit.log('MARK_CURRENT', 'Upload', id, { fileId: body.fileId });
    return { ok: true };
  }

  @Post('uploads/:id/lock-file')
  async lock(@Param('id') id: string, @Body() body: { fileId: string; lock: boolean }) {
    await this.prisma.uploadFile.update({ where: { id: body.fileId }, data: { isLockedForShowBool: body.lock } });
    await this.audit.log('LOCK_FILE', 'Upload', id, body);
    return { ok: true };
  }

  @Post('uploads/:id/comment')
  comment(@Param('id') id: string, @Body() body: { comment: string }) { return this.audit.log('UPLOAD_COMMENT', 'Upload', id, { comment: body.comment }); }

  @Post('uploads/:id/bind-session')
  bind(@Param('id') id: string, @Body() body: { sessionId: string }) { return this.prisma.upload.update({ where: { id }, data: { sessionId: body.sessionId, status: 'READY' as any } }); }

  @Get('tech/readyboard')
  async readyboard(@Query('conferenceId') conferenceId: string, @Query('minutes') minutes = '60') {
    const until = new Date(Date.now() + Number(minutes) * 60_000);
    const sessions = await this.prisma.session.findMany({ where: { conferenceId, startTime: { lte: until } }, orderBy: { startTime: 'asc' } });
    const uploads = await this.prisma.upload.findMany({ where: { conferenceId }, include: { files: true } });
    return sessions.map((s) => {
      const u = uploads.find((x) => x.sessionId === s.id);
      return { session: s, status: u ? u.status : 'NO_FILE', lockedForShow: u?.files.some((f) => f.isLockedForShowBool) || false };
    });
  }
}
