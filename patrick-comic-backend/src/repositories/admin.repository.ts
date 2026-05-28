// src/repositories/admin.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemCounts() {
    // Chạy song song các câu lệnh count để tối ưu tốc độ truy vấn từ database
    const [stories, users, reports, comments] = await Promise.all([
      this.prisma.truyen.count(),
      this.prisma.nguoiDung.count(),
      this.prisma.baoLoi.count(),
      this.prisma.binhLuan.count(),
    ]);

    return {
      stories,
      users,
      reports,
      comments,
    };
  }
}