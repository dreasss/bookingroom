import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaService } from './prisma/prisma.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { BrandingController } from './branding/branding.controller';
import { SessionsController } from './sessions/sessions.controller';
import { UploadsController } from './uploads/uploads.controller';
import { AdminController } from './admin/admin.controller';
import { TerminalsController } from './terminals/terminals.controller';
import { HelpController } from './help/help.controller';
import { WebhooksController } from './webhooks/webhooks.controller';
import { AuditController } from './audit/audit.controller';
import { QueueService } from './queue/queue.service';
import { AuditService } from './audit/audit.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ThrottlerModule.forRoot([{ ttl: 60_000, limit: 40 }])],
  controllers: [
    AuthController,
    BrandingController,
    SessionsController,
    UploadsController,
    AdminController,
    TerminalsController,
    HelpController,
    WebhooksController,
    AuditController,
  ],
  providers: [PrismaService, AuthService, QueueService, AuditService],
})
export class AppModule {}
