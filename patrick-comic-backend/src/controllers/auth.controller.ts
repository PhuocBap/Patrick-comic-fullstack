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
  async validate(@Body() body: { tenDangNhap?: string; matKhau?: string }) {
    // 🔥 AN TOÀN: Truyền các trường với toán tử điều kiện dự phòng để không bao giờ bị undefined
    return this.authService.validateUser(body?.tenDangNhap || '', body?.matKhau || '');
  }

  /**
   * 🔥 THÊM MỚI POST: http://localhost:3001/auth/logout
   */
  @Post('logout')
  async logout(@Body() body: { tenDangNhap?: string }) {
    return this.authService.invalidateSession(body?.tenDangNhap || '');
  }
}