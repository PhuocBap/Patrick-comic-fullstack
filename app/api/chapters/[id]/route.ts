import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

/**
 * 1. API CẬP NHẬT CHƯƠNG (PATCH)
 * Dùng để sửa tên chương, số chương hoặc danh sách link ảnh (nội dung)
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tenChuong, soChuong, noiDung } = body;

    // Chuyển ID và số chương sang kiểu Number để Prisma hiểu
    const chapterId = Number(id);
    const chapterNumber = Number(soChuong);

    if (isNaN(chapterId)) {
      return NextResponse.json({ message: "ID không hợp lệ" }, { status: 400 });
    }

    const updatedChapter = await prisma.chuong.update({
      where: { id: chapterId },
      data: {
        tenChuong: tenChuong,
        soChuong: chapterNumber,
        noiDung: noiDung, // Chuỗi các link ảnh cách nhau bởi dấu xuống dòng
      },
    });

    return NextResponse.json({
      message: "Cập nhật chương thành công!",
      data: updatedChapter,
    });
  } catch (error: any) {
    console.error("Lỗi PATCH Chapter:", error);
    return NextResponse.json(
      { message: "Lỗi khi cập nhật chương", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * 2. API XÓA CHƯƠNG (DELETE)
 * Dùng để xóa vĩnh viễn một chương khỏi database
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapterId = Number(id);

    if (isNaN(chapterId)) {
      return NextResponse.json({ message: "ID không hợp lệ" }, { status: 400 });
    }

    await prisma.chuong.delete({
      where: { id: chapterId },
    });

    return NextResponse.json({ message: "Đã xóa chương vĩnh viễn!" });
  } catch (error: any) {
    console.error("Lỗi DELETE Chapter:", error);
    return NextResponse.json(
      { message: "Lỗi khi xóa chương hoặc chương không tồn tại", error: error.message },
      { status: 500 }
    );
  }
}