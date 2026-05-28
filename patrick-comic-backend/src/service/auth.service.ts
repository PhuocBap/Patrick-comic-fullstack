import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}

  /**
   * 1. Logic Đăng ký người dùng
   */
  async register(body: { tenDangNhap: string; matKhau: string; email?: string; adminCode?: string }) {
    const { tenDangNhap, matKhau, email, adminCode } = body;

    // Kiểm tra người dùng tồn tại qua Repo
    const userExists = await this.userRepo.findByUsernameOrEmail(tenDangNhap, email);

    if (userExists) {
      throw new ConflictException('Tên đăng nhập hoặc Email đã được sử dụng');
    }

    // Băm mật khẩu
    const hashedPassword = await bcrypt.hash(matKhau, 10);

    // Kiểm tra quyền Admin
    const ADMIN_SECRET = "phuoc_admin_123"; 
    const finalRole = adminCode === ADMIN_SECRET ? "ADMIN" : "USER";

    const newUser = await this.userRepo.create({
      tenDangNhap: tenDangNhap.trim(),
      matKhau: hashedPassword,
      email: email?.trim() || null,
      vaiTro: finalRole,
    });

    const { matKhau: _, ...userWithoutPassword } = newUser;
    return {
      message: finalRole === "ADMIN" ? "Đăng ký thành công tài khoản ADMIN!" : "Đăng ký thành công!",
      user: userWithoutPassword,
    };
  }

  /**
   * 2. Logic Kiểm tra Đăng nhập (Dùng cho NextAuth Authorize)
   */
  async validateUser(tenDangNhap: string, matKhau: string) {
    const user = await this.userRepo.findByUsername(tenDangNhap);

    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');

    // CẬP NHẬT: Kiểm tra xem tài khoản có đang bị khóa hay không
    if (user.isBlocked) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa bởi Ban Quản Trị!');
    }

    const isPasswordValid = await bcrypt.compare(matKhau, user.matKhau);
    if (!isPasswordValid) throw new UnauthorizedException('Mật khẩu không chính xác');

    const { matKhau: _, ...result } = user;
    return result;
  }
}