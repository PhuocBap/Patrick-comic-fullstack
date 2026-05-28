// src/repositories/theloai.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Đã sửa đường dẫn chuẩn xác theo cấu trúc dự án

@Injectable()
export class TheLoaiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.theLoai.findMany({
      orderBy: { ten: 'asc' },
    });
  }

  async findById(id: string) {
    return this.prisma.theLoai.findUnique({
      where: { id: id },
      include: {
        truyens: {
          select: {
            id: true,
            tenTruyen: true,
            slug: true,
            thumbnail: true,
            trangThai: true,
            luotXem: true,
            chuongs: {
              orderBy: { soChuong: 'desc' },
              take: 1,
              select: { soChuong: true }
            }
          }
        }
      }
    });
  }

 async findByName(name: string) {
    return this.prisma.theLoai.findFirst({
      where: {
        ten: {
          equals: name.trim(),
        },
      },
    });
  }

  async create(name: string) {
    return this.prisma.theLoai.create({
      data: { ten: name.trim() },
    });
  }



  async delete(id: string) {
    return this.prisma.theLoai.delete({
      where: { id },
    });
  }
}