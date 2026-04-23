import { prisma } from "../lib/prisma";

export const updateReadingHistory = async (userId: string, truyenId: number, chuongId: number) => {
  return await prisma.lichSuDoc.upsert({
    where: {
      // Đảm bảo tên nguoiDungId_truyenId khớp với @@unique trong schema.prisma
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
};

export const getUserHistory = async (userId: string) => {
  return await prisma.lichSuDoc.findMany({
    where: { nguoiDungId: userId },
    orderBy: { thoiGianDoc: "desc" },
    include: {
      truyen: {
        select: {
          id: true,
          tenTruyen: true,
          slug: true,
          thumbnail: true,
        },
      },
      chuong: {
        select: {
          tenChuong: true,
          soChuong: true,
        },
      },
    },
  });
};