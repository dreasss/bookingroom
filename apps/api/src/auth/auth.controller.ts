import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
}

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) { return this.auth.login(dto.email, dto.password); }

  @Post('refresh')
  refresh(@Body() body: { refresh: string }) { return this.auth.refresh(body.refresh); }

  @Post('logout')
  logout() { return { ok: true }; }

  @ApiBearerAuth()
  @Get('me')
  me(@Headers('authorization') auth?: string) { return { authenticated: Boolean(auth) }; }
}
