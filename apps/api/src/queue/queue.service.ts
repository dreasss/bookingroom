import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  enqueueAntivirus(uploadFileId: string) { this.logger.log(`antivirusScan queued: ${uploadFileId}`); }
  enqueuePreview(uploadFileId: string) { this.logger.log(`generatePreview queued: ${uploadFileId}`); }
  enqueueZipInspect(uploadFileId: string) { this.logger.log(`zipInspect queued: ${uploadFileId}`); }
}
