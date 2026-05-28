import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Dùng cho logic Login / Validate của Auth
  async findByUsername(tenDangNhap: string) {
    return this.prisma.nguoiDung.findUnique({
      where: { tenDangNhap },
    });
  }

  // Dùng cho logic Register
  async findByUsernameOrEmail(tenDangNhap: string, email?: string) {
    return this.prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { tenDangNhap: tenDangNhap },
          ...(email ? [{ email: email }] : []),
        ],
      },
    });
  }

  async create(data: { tenDangNhap: string; matKhau: string; email: string | null; vaiTro: string }) {
    return this.prisma.nguoiDung.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.nguoiDung.findMany({
      select: {
        id: true,
        tenDangNhap: true,
        email: true,
        vaiTro: true,
        isBlocked: true, // Thêm để frontend đọc trạng thái Khóa/Hoạt động
      },
      orderBy: { id: 'desc' },
    });
  }

  async updateRole(id: string, role: string) {
    return this.prisma.nguoiDung.update({
      where: { id },
      data: { vaiTro: role },
    });
  }

  async updateBlockStatus(id: string, isBlocked: boolean) {
    return this.prisma.nguoiDung.update({
      where: { id },
      data: { isBlocked },
    });
  }

  async deleteUser(id: string) {
    return this.prisma.nguoiDung.delete({
      where: { id },
    });
  }
}