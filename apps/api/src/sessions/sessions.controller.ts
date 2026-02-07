import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@ApiTags('sessions')
@Controller('api/sessions')
export class SessionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query('conferenceId') conferenceId: string, @Query('query') query?: string) {
    return this.prisma.session.findMany({
      where: {
        conferenceId,
        ...(query
          ? {
              OR: [
                { speakerName: { contains: query, mode: 'insensitive' } },
                { speakerOrg: { contains: query, mode: 'insensitive' } },
                { title: { contains: query, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      take: 50,
    });
  }

  @Post('import')
  importCsv(@Body() body: { conferenceId: string; rows: Array<Record<string, string>> }) {
    return Promise.all(
      body.rows.map((r) =>
        this.prisma.session.create({
          data: {
            conferenceId: body.conferenceId,
            title: r.title,
            section: r.section,
            room: r.room,
            startTime: new Date(r.startTime),
            endTime: new Date(r.endTime),
            speakerName: r.speakerName,
            speakerOrg: r.speakerOrg,
            code: r.code || randomBytes(3).toString('hex').toUpperCase(),
          },
        }),
      ),
    );
  }

  @Post(':id/generate-codes')
  async generate(@Param('id') id: string) {
    const code = randomBytes(4).toString('hex').slice(0, 8).toUpperCase();
    const updated = await this.prisma.session.update({ where: { id }, data: { code, qrTokenSeed: randomBytes(12).toString('hex') } });
    return { code: updated.code, qrPayload: `conference://session/${updated.id}?code=${updated.code}` };
  }

  @Get('upcoming')
  upcoming(@Query('conferenceId') conferenceId: string, @Query('minutes') minutes = '60') {
    const end = new Date(Date.now() + Number(minutes) * 60 * 1000);
    return this.prisma.session.findMany({ where: { conferenceId, startTime: { lte: end } }, orderBy: { startTime: 'asc' } });
  }
}
