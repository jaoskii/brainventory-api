import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicAuthGuard } from '../guards/basic-auth.guard';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: unknown) {
    return this.authService.register(body);
  }

  @Post('login')
  @UseGuards(BasicAuthGuard)
  login(@Body() body: unknown) {
    return this.authService.login(body);
  }

  @Post('logout')
  logout(@Req() req: unknown) {
    return this.authService.logout(req);
  }

  @Post('refresh')
  refresh(@Body() body: unknown) {
    return this.authService.refresh(body);
  }

  @Get('me')
  me(@Req() req: unknown) {
    return this.authService.me(req);
  }
}
