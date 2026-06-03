// src/repositories/chuong.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChuongRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTruyenBySlug(slug: string) {
    return this.prisma.truyen.findUnique({
      where: { slug },
    });
  }

  async findChapterByNumberAndTruyenId(soChuong: number, truyenId: number) {
    return this.prisma.chuong.findFirst({
      where: { soChuong, truyenId },
      include: {
        truyen: {
          select: {
            tenTruyen: true,
            slug: true,
            chuongs: {
              select: { soChuong: true, tenChuong: true },
              orderBy: { soChuong: 'asc' },
            },
          },
        },
      },
    });
  }

  async incrementTruyenViewRaw(truyenId: number) {
  // Sử dụng dấu bạcktick kèm $executeRaw của Prisma giúp tự động ép tham số, chống SQL Injection
  this.prisma.$executeRaw`
    UPDATE "Truyen" 
    SET "luotXem" = COALESCE("luotXem", 0) + 1 
    WHERE "id" = ${truyenId}
  `.catch(err => console.error("Lỗi tăng view ngầm bằng Raw SQL:", err));
}

  async findById(id: number) {
    return this.prisma.chuong.findUnique({
      where: { id },
      include: { truyen: true },
    });
  }

  async create(data: { tenChuong: string; soChuong: number; noiDung: string; truyenId: number }) {
    // Đảm bảo tạo chương thành công trước, sau đó mới cập nhật ngày của truyện
    const newChapter = await this.prisma.chuong.create({
      data,
    });

    // Tạo thành công hoàn toàn mới update thời gian hiển thị của truyện
    await this.prisma.truyen.update({
      where: { id: data.truyenId },
      data: { ngayCapNhat: new Date() },
    });

    return newChapter;
  }

  async update(id: number, data: any) {
    return this.prisma.chuong.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return this.prisma.chuong.delete({
      where: { id },
    });
  }
}