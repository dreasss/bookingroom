import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  private readonly jwt = new JwtService({ secret: process.env.JWT_SECRET || 'dev-secret', signOptions: { expiresIn: '15m' } });

  constructor(private readonly prisma: PrismaService) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException('Invalid credentials');
    const access = this.jwt.sign({ sub: user.id, role: user.role, email: user.email });
    const refresh = this.jwt.sign({ sub: user.id, type: 'refresh' }, { expiresIn: '30d' });
    return { access, refresh, user: { id: user.id, email: user.email, role: user.role } };
  }

  refresh(token: string) {
    const payload = this.jwt.verify(token);
    return { access: this.jwt.sign({ sub: payload.sub, role: payload.role }) };
  }
}
