// src/repositories/report.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.baoLoi.findMany({
      include: {
        chuong: { 
          select: { 
            soChuong: true, 
            truyen: { select: { tenTruyen: true } } 
          } 
        }
      },
      orderBy: { id: 'desc' },
    });
  }

  async findById(id: number | string) {
    return this.prisma.baoLoi.findUnique({
      where: { id: id as any },
    });
  }

  async create(data: { loaiLoi: string; moTa?: string; chuongId: number }) {
    return this.prisma.baoLoi.create({
      data: {
        loaiLoi: data.loaiLoi,
        moTa: data.moTa,
        chuongId: data.chuongId,
      },
    });
  }

  async delete(id: number | string) {
    return this.prisma.baoLoi.delete({ 
      where: { id: id as any } 
    });
  }
}