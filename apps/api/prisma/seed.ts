import { PrismaClient, Role, UploadStatus, MatchMode } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash('admin12345', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@conference.local' },
    update: {},
    create: { email: 'admin@conference.local', passwordHash: adminPass, role: Role.ADMIN },
  });

  const conf = await prisma.conference.upsert({
    where: { id: 'demo-conference' },
    update: {},
    create: {
      id: 'demo-conference',
      name: 'Future Science Forum 2026',
      dates: '2026-10-12..2026-10-14',
      slogan: 'Upload once, present confidently',
      helpContacts: '+7 (900) 123-45-67',
      defaultLang: 'RU',
    },
  });

  await prisma.brandKit.upsert({
    where: { conferenceId: conf.id },
    update: {},
    create: {
      conferenceId: conf.id,
      colorsJson: { primary: '#5b21b6', accent: '#06b6d4' },
      gradientJson: { type: 'linear', angle: 135 },
      fontsJson: { body: 'Inter' },
      uiStyleJson: { radius: 12, shadow: 'soft' },
      textsJson: { attractTitle: 'Сдать доклад' },
    },
  });

  const terminal = await prisma.terminal.create({ data: { name: 'Terminal A', location: 'Main Hall', status: 'ONLINE' } });

  const session = await prisma.session.create({
    data: {
      conferenceId: conf.id,
      title: 'LLM in Science',
      section: 'AI',
      room: 'Hall A',
      startTime: new Date(Date.now() + 3 * 3600 * 1000),
      endTime: new Date(Date.now() + 4 * 3600 * 1000),
      speakerName: 'Anna Ivanova',
      speakerOrg: 'ITMO',
      code: 'AI7421',
      qrTokenSeed: 'seed-ai7421',
    },
  });

  await prisma.upload.create({
    data: {
      conferenceId: conf.id,
      sessionId: session.id,
      terminalId: terminal.id,
      status: UploadStatus.READY,
      matchedBy: MatchMode.CODE,
    },
  });

  console.log({ admin: admin.email, conference: conf.name });
}

main().finally(() => prisma.$disconnect());
