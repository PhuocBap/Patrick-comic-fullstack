import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; 

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { soChuong, tenChuong, noiDung, truyenId } = body;

    // 1. Kiểm tra đầu vào
    if (soChuong === undefined || !truyenId || !noiDung) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ: Số chương, ID truyện và nội dung ảnh." },
        { status: 400 }
      );
    }

    // 2. Kiểm tra truyện có tồn tại không
    const storyExists = await prisma.truyen.findUnique({
      where: { id: Number(truyenId) },
    });

    if (!storyExists) {
      return NextResponse.json({ error: "Truyện này không tồn tại!" }, { status: 404 });
    }

    // 3. Tạo chương mới
    const newChapter = await prisma.chuong.create({
      data: {
        soChuong: Number(soChuong),
        tenChuong: tenChuong || "",
        noiDung: noiDung,
        truyenId: Number(truyenId),
      },
    });

    return NextResponse.json(
      { message: "Thêm chương thành công!", data: newChapter },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Lỗi POST Chapter:", error);
    // Bắt lỗi trùng số chương trong cùng một truyện
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Số chương này đã tồn tại trong truyện này!" }, { status: 400 });
    }
    return NextResponse.json({ error: "Lỗi server", detail: error.message }, { status: 500 });
  }
}