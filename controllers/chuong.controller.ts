import { prisma } from "../lib/prisma";

/**
 * Lấy nội dung chương và tự động tăng lượt xem cho truyện
 */
export const getChapterPages = async (chapterId: string | number) => {
  if (!chapterId) return null;

  try {
    // 1. Ép kiểu ID về Number để khớp với Prisma Schema (Int)
    const idAsNumber = typeof chapterId === 'string' ? parseInt(chapterId, 10) : chapterId;

    if (isNaN(idAsNumber)) {
      console.error("ID chương không hợp lệ:", chapterId);
      return null;
    }

    // 2. Truy vấn dữ liệu chương kèm thông tin truyện
    const data = await prisma.chuong.findUnique({
      where: { 
        id: idAsNumber 
      },
      include: {
        trangTruyens: {
          orderBy: { soThuTu: 'asc' } 
        },
        truyen: {
          select: {
            id: true,
            tenTruyen: true,
            slug: true,
          }
        }
      }
    });

    if (!data) return null;

    // 3. Tăng lượt xem (Increment views)
    if (data.truyenId) {
      await prisma.truyen.update({
        where: { id: data.truyenId },
        data: {
          luotXem: {
            increment: 1
          }
        }
      }).catch(err => console.error("Lỗi cập nhật lượt xem:", err));
    }

    return data;
  } catch (error) {
    console.error("Lỗi hệ thống tại getChapterPages:", error);
    return null;
  }
};

/**
 * Lấy danh sách chương theo ID truyện
 */
export const getChaptersByStoryId = async (storyId: number) => {
  try {
    return await prisma.chuong.findMany({
      where: { truyenId: storyId },
      orderBy: { soChuong: 'asc' },
      select: {
        id: true,
        soChuong: true,
        tenChuong: true,
        ngayTao: true
      }
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách chương:", error);
    return [];
  }
};