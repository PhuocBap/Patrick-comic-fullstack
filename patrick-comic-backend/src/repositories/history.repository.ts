// src/repositories/history.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class HistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prisma.nguoiDung.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return this.prisma.nguoiDung.findUnique({
      where: { id },
    });
  }

  async upsertHistory(userId: string, truyenId: number, chuongId: number) {
    return this.prisma.lichSuDoc.upsert({
      where: {
        nguoiDungId_truyenId: {
          nguoiDungId: userId,
          truyenId: truyenId,
        },
      },
      update: {
        chuongId: chuongId,
        thoiGianDoc: new Date(),
      },
      create: {
        nguoiDungId: userId,
        truyenId: truyenId,
        chuongId: chuongId,
      },
    });
  }

  async findHistoryByUserId(userId: string) {
    return this.prisma.lichSuDoc.findMany({
      where: { nguoiDungId: userId },
      include: {
        truyen: {
          select: {
            id: true,
            tenTruyen: true,
            thumbnail: true,
            slug: true,
          },
        },
        chuong: {
          select: {
            soChuong: true,
            tenChuong: true,
          },
        },
      },
      orderBy: { thoiGianDoc: 'desc' },
    });
  }
}