import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; 
export async function GET() {
  try {
    const topStories = await prisma.truyen.findMany({
      take: 10, // Lấy 10 truyện
      orderBy: {
        luotXem: 'desc', // Sắp xếp giảm dần: truyện nhiều view nhất lên đầu
      },
      select: {
        id: true,
        tenTruyen: true,
        thumbnail: true,
        luotXem: true,
        slug: true,
        // Bạn có thể lấy thêm số chương nếu có bảng Chuong liên kết
      }
    });

    return NextResponse.json(topStories);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi lấy dữ liệu" }, { status: 500 });
  }
}