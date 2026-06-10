import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { RedisService } from './redis.service'; // 🔥 THÊM: Import RedisService
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  // 🔥 CẬP NHẬT: Inject thêm RedisService vào constructor cạnh userRepo cũ
  constructor(
    private readonly userRepo: UserRepository,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 1. Logic Đăng ký người dùng (GIỮ NGUYÊN HOÀN TOÀN)
   */
  async register(body: { tenDangNhap: string; matKhau: string; email?: string; adminCode?: string }) {
    const { tenDangNhap, matKhau, email, adminCode } = body;

    const userExists = await this.userRepo.findByUsernameOrEmail(tenDangNhap, email);

    if (userExists) {
      throw new ConflictException('Tên đăng nhập hoặc Email đã được sử dụng');
    }

    const hashedPassword = await bcrypt.hash(matKhau, 10);

    const ADMIN_SECRET = "phuoc_admin_123"; 
    const finalRole = adminCode === ADMIN_SECRET ? "ADMIN" : "USER";

    const newUser = await this.userRepo.create({
      tenDangNhap: (tenDangNhap || '').trim(), // 🔥 AN TOÀN: Bọc chống crash trim
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
   * 2. Logic Kiểm tra Đăng nhập (TỐI ƯU BẰNG REDIS CACHE - ĐÃ BỌC AN TOÀN)
   */
  async validateUser(tenDangNhap: string, matKhau: string) {
    // 🔥 SỬA TẠI ĐÂY: Bảo vệ an toàn tuyệt đối chuỗi tên đăng nhập, tránh lỗi undefined.trim()
    const safeUsername = (tenDangNhap || '').trim();
    const safePassword = matKhau || '';

    if (!safeUsername || !safePassword) {
      throw new UnauthorizedException('Tên đăng nhập và mật khẩu không được để trống!');
    }

    const sessionKey = `user:session:${safeUsername}`;

    try {
      // 🛡️ Bước A: Thử tìm thông tin phiên đăng nhập đã được cache trên RAM Redis
      const cachedUser = await this.redisService.get(sessionKey);
      if (cachedUser) {
        const user = JSON.parse(cachedUser);

        // Vẫn phải check mật khẩu để đảm bảo an toàn tuyệt đối nếu có thay đổi bí mật
        const isPasswordValid = await bcrypt.compare(safePassword, user.matKhau);
        if (!isPasswordValid) throw new UnauthorizedException('Mật khẩu không chính xác');

        const { matKhau: _, ...result } = user;
        return result;
      }
    } catch (error) {
      console.error('⚠️ Lỗi đọc session từ Redis (Chuyển hướng kiểm tra DB):', (error as Error).message);
    }

    // 🛡️ Bước B: CACHE MISS hoặc Redis sập -> Chọc xuống PostgreSQL kiểm tra như cũ
    const user = await this.userRepo.findByUsername(safeUsername);

    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');

    if (user.isBlocked) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa bởi Ban Quản Trị!');
    }

    const isPasswordValid = await bcrypt.compare(safePassword, user.matKhau);
    if (!isPasswordValid) throw new UnauthorizedException('Mật khẩu không chính xác');

    try {
      // 🛡️ Bước C: Đăng nhập đúng -> Tiện tay lưu nguyên cục User này lên RAM Redis
      // Đặt TTL là 1800 giây (30 phút) bằng đúng thời gian sống mặc định của phiên làm việc
      await this.redisService.set(sessionKey, user, 1800);
    } catch (error) {
      console.error('⚠️ Lỗi ghi session vào Redis:', (error as Error).message);
    }

    const { matKhau: _, ...result } = user;
    return result;
  }

  /**
   * 🔥 THÊM MỚI: Hàm xóa nhanh session đăng nhập khi user bấm nút Logout trên UI
   */
  async invalidateSession(tenDangNhap: string) {
    try {
      const safeUsername = (tenDangNhap || '').trim();
      if (safeUsername) {
        await this.redisService.del(`user:session:${safeUsername}`);
      }
      return { success: true, message: 'Thu hồi phiên đăng nhập trên RAM thành công.' };
    } catch (error) {
      console.error('⚠️ Không thể xóa session:', (error as Error).message);
      return { success: false };
    }
  }
}