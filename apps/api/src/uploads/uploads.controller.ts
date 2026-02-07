import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MatchMode, UploadStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { AuditService } from '../audit/audit.service';
import { evaluateDeadline, nextVersion } from './upload.policy';
import { issuePhoneToken, usePhoneToken, validatePhoneToken } from './phone-token.store';

@ApiTags('uploads')
@Controller('api')
export class UploadsController {
  constructor(private readonly prisma: PrismaService, private readonly queue: QueueService, private readonly audit: AuditService) {}

  @Post('uploads/init')
  async init(@Body() body: { mode: MatchMode; sessionCode?: string; sessionId?: string; guestForm?: unknown; terminalId: string; conferenceId: string }) {
    let sessionId = body.sessionId;
    if (!sessionId && body.sessionCode) {
      const s = await this.prisma.session.findUnique({ where: { code: body.sessionCode } });
      sessionId = s?.id;
    }
    const session = sessionId ? await this.prisma.session.findUnique({ where: { id: sessionId } }) : null;
    const deadlinePolicyResult = session ? evaluateDeadline(session.startTime, 2, 'warn') : { accepted: true, violation: false, mode: 'warn' };

    const upload = await this.prisma.upload.create({
      data: {
        conferenceId: body.conferenceId,
        sessionId: session?.id,
        guestDataJson: body.mode === 'GUEST' ? (body.guestForm as object) : undefined,
        terminalId: body.terminalId,
        status: UploadStatus.RECEIVED,
        matchedBy: body.mode,
      },
    });
    await this.audit.log('UPLOAD_INIT', 'Upload', upload.id, { conferenceId: body.conferenceId });

    const oneTimeToken = issuePhoneToken(upload.id);
    return {
      uploadId: upload.id,
      constraints: { maxFiles: 3, maxSizeMB: 512, allowedExt: ['pptx', 'pdf', 'key', 'mp4', 'zip'] },
      deadlinePolicyResult,
      oneTimeToken,
    };
  }

  @Post('uploads/:id/presign')
  presign(@Param('id') id: string, @Body() body: { filename: string; mime: string }) {
    const storageKey = `${id}/${Date.now()}-${body.filename.replace(/\s+/g, '_')}`;
    return { putUrl: `http://minio:9000/conference-uploads/${storageKey}`, storageKey, requiredHeaders: { 'content-type': body.mime } };
  }

  @Post('uploads/:id/commit')
  async commit(@Param('id') id: string, @Body() body: { files: Array<{ originalName: string; storedKey: string; size: number; mime: string; ext: string; checksum?: string }> }) {
    const upload = await this.prisma.upload.findUnique({ where: { id }, include: { files: true } });
    if (!upload) return { error: 'not_found' };

    for (const file of body.files) {
      const versionInt = nextVersion(upload.files);
      const created = await this.prisma.uploadFile.create({
        data: {
          uploadId: id,
          originalName: file.originalName,
          storedKey: file.storedKey,
          sizeBytes: BigInt(file.size),
          mime: file.mime,
          ext: file.ext,
          versionInt,
          checksum: file.checksum,
        },
      });
      this.queue.enqueueAntivirus(created.id);
      this.queue.enqueuePreview(created.id);
      if (file.ext === 'zip') this.queue.enqueueZipInspect(created.id);
    }

    await this.prisma.upload.update({ where: { id }, data: { status: UploadStatus.SCANNING } });
    return { status: 'queued' };
  }

  @Get('uploads/:id/status')
  status(@Param('id') id: string) {
    return this.prisma.upload.findUnique({ where: { id }, include: { files: true } });
  }

  @Post('uploads/:id/request-email')
  requestEmail(@Param('id') id: string, @Body() body: { email: string }) {
    return { accepted: true, uploadId: id, email: body.email };
  }

  @Get('phone-upload/validate')
  validatePhone(@Query('token') token: string) { return validatePhoneToken(token); }

  @Post('phone-upload/presign')
  phonePresign(@Query('token') token: string, @Body() body: { filename: string; mime: string }) {
    const val = validatePhoneToken(token);
    if (!val.valid) return val;
    const storageKey = `${val.uploadId}/phone-${Date.now()}-${body.filename}`;
    return { putUrl: `http://minio:9000/conference-uploads/${storageKey}`, storageKey };
  }

  @Post('phone-upload/commit')
  phoneCommit(@Query('token') token: string, @Body() body: { files: Array<{ originalName: string; storedKey: string; size: number; mime: string; ext: string }> }) {
    const val = validatePhoneToken(token);
    if (!val.valid) return val;
    usePhoneToken(token);
    return this.commit(val.uploadId, { files: body.files });
  }
}
