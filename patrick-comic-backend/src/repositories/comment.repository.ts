// src/repositories/comment.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByStory(truyenId: number) {
    return this.prisma.binhLuan.findMany({
      where: { truyenId },
      include: { nguoiDung: { select: { tenDangNhap: true } } },
      orderBy: { id: "desc" }
    });
  }

  async findAllForAdmin(whereCondition: any) {
    return this.prisma.binhLuan.findMany({
      where: whereCondition,
      include: {
        nguoiDung: { select: { tenDangNhap: true } },
        truyen: { select: { id: true, tenTruyen: true } },
        chuong: { select: { id: true, soChuong: true } }
      },
      orderBy: { id: 'desc' }
    });
  }

  async create(data: { noiDung: string; truyenId: number; chuongId: number | null; nguoiDungId: string }) {
    return this.prisma.binhLuan.create({
      data,
      include: { nguoiDung: { select: { tenDangNhap: true } } }
    });
  }

  async delete(id: string) {
    return this.prisma.binhLuan.delete({
      where: { id }
    });
  }
}