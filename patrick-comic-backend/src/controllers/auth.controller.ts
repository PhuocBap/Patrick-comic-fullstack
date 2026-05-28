import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST: http://localhost:3001/auth/register
   */
  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  /**
   * POST: http://localhost:3001/auth/validate (Dùng nội bộ cho NextAuth)
   */
  @Post('validate')
  async validate(@Body() body: { tenDangNhap: string; matKhau: string }) {
    return this.authService.validateUser(body.tenDangNhap, body.matKhau);
  }
}