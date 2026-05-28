import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async register(data: { tenDangNhap: string; matKhau: string; email?: string; adminCode?: string }) {
    const { tenDangNhap, matKhau, email, adminCode } = data;

    // 1. Kiểm tra trùng lặp qua Repo
    const userExists = await this.userRepo.findByUsernameOrEmail(tenDangNhap, email);

    if (userExists) {
      const field = userExists.tenDangNhap === tenDangNhap ? "Tên đăng nhập" : "Email";
      throw new ConflictException(`${field} đã được sử dụng`);
    }

    // 2. Hash mật khẩu và kiểm tra Role
    const hashedPassword = await bcrypt.hash(matKhau, 10);
    const ADMIN_SECRET = "phuoc_admin_123"; 
    const finalRole = adminCode === ADMIN_SECRET ? "ADMIN" : "USER";

    try {
      const newUser = await this.userRepo.create({
        tenDangNhap: tenDangNhap.trim(),
        matKhau: hashedPassword,
        email: email ? email.trim() : null,
        vaiTro: finalRole,
      });

      const { matKhau: _, ...userWithoutPassword } = newUser;
      return { 
        message: finalRole === "ADMIN" ? "Đăng ký thành công tài khoản ADMIN!" : "Đăng ký thành công!", 
        user: userWithoutPassword 
      };
    } catch (error) {
      throw new InternalServerErrorException("Có lỗi xảy ra khi tạo tài khoản");
    }
  }

  async findAll() {
    return await this.userRepo.findAll();
  }

  async updateRole(id: string, role: string) {
    return await this.userRepo.updateRole(String(id), role);
  }

  async toggleBlock(id: string, isBlocked: boolean) {
    return await this.userRepo.updateBlockStatus(String(id), isBlocked);
  }

  async deleteUser(id: string) {
    return await this.userRepo.deleteUser(String(id));
  }
}