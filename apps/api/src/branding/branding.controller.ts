import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('branding')
@Controller('api/branding')
export class BrandingController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  get(@Query('conferenceId') conferenceId: string) {
    return this.prisma.brandKit.findUnique({ where: { conferenceId } });
  }

  @Put()
  update(@Query('conferenceId') conferenceId: string, @Body() body: Record<string, unknown>) {
    return this.prisma.brandKit.update({ where: { conferenceId }, data: body });
  }

  @Get('preview')
  async preview(@Query('conferenceId') conferenceId: string) {
    const brand = await this.prisma.brandKit.findUnique({ where: { conferenceId } });
    return {
      cssVars: {
        '--brand-primary': (brand?.colorsJson as any)?.primary || '#5b21b6',
        '--brand-accent': (brand?.colorsJson as any)?.accent || '#06b6d4',
      },
    };
  }
}
