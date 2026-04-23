import { prisma } from "../lib/prisma";

/**
 * Lấy chi tiết một bộ truyện và TỰ ĐỘNG TĂNG LƯỢT XEM
 */
export const getComicDetail = async (id: string | number) => {
  if (!id) return null;
  try {
    const numericId = typeof id === "string" ? parseInt(id) : id;
    if (isNaN(numericId)) return null;

    // Sử dụng prisma.truyen.update để vừa lấy dữ liệu vừa tăng lượt xem cùng lúc
    return await prisma.truyen.update({
      where: { id: numericId },
      data: {
        luotXem: {
          increment: 1 // Prisma sẽ tự cộng thêm 1 vào giá trị hiện tại trong DB
        }
      },
      include: {
        chuongs: { 
          orderBy: { soChuong: 'asc' } 
        },
        theLoais: true 
      },
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết và cập nhật lượt xem:", error);
    return null;
  }
};

/**
 * Lấy danh sách truyện mới cập nhật (phân trang)
 */
export const getLatestComics = async (skip = 0, take = 12) => {
  try {
    return await prisma.truyen.findMany({
      skip: Number(skip),
      take: Number(take),
      orderBy: { ngayTao: 'desc' }, 
      include: {
        chuongs: {
          take: 1,
          orderBy: { soChuong: 'desc' }
        },
        theLoais: true 
      }
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách truyện:", error);
    return [];
  }
};