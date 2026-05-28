// src/repositories/follow.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FollowRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueFollow(userId: string, truyenId: number) {
    return this.prisma.theoDoi.findUnique({
      where: {
        nguoiDungId_truyenId: {
          nguoiDungId: userId,
          truyenId: truyenId,
        },
      },
    });
  }

  async create(userId: string, truyenId: number) {
    return this.prisma.theoDoi.create({
      data: { nguoiDungId: userId, truyenId },
    });
  }

  async delete(id: number | string) {
    return this.prisma.theoDoi.delete({
      where: { id: id as any },
    });
  }

  async findManyByUser(userId: string) {
    return this.prisma.theoDoi.findMany({
      where: { nguoiDungId: userId },
      include: { truyen: true }, // Đảm bảo lấy kèm thông tin chi tiết của truyện
      orderBy: { id: 'desc' },
    });
  }
}