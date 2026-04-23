import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

// --- GET: Lấy chi tiết chương để sửa ---
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapterId = parseInt(id, 10);

    if (isNaN(chapterId)) {
      return NextResponse.json({ error: "ID chương không hợp lệ" }, { status: 400 });
    }

    const chapter = await prisma.chuong.findUnique({
      where: { id: chapterId },
      include: {
        truyen: {
          select: { tenTruyen: true, slug: true },
        },
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Không tìm thấy chương" }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi hệ thống", detail: error.message }, { status: 500 });
  }
}

// --- PATCH: Cập nhật chương ---
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tenChuong, soChuong, noiDung } = body;

    const chapterId = Number(id);
    if (isNaN(chapterId)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    const updatedChapter = await prisma.chuong.update({
      where: { id: chapterId },
      data: {
        tenChuong: tenChuong,
        soChuong: soChuong !== undefined ? Number(soChuong) : undefined,
        noiDung: noiDung,
      },
    });

    return NextResponse.json({
      message: "Cập nhật chương thành công!",
      data: updatedChapter,
    });
  } catch (error: any) {
    console.error("❌ Lỗi PATCH Chapter:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Số chương này đã tồn tại!" }, { status: 400 });
    }
    return NextResponse.json({ error: "Lỗi cập nhật", detail: error.message }, { status: 500 });
  }
}

// --- DELETE: Xóa chương ---
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chapterId = Number(id);

    if (isNaN(chapterId)) {
      return NextResponse.json({ error: "ID không hợp lệ" }, { status: 400 });
    }

    await prisma.chuong.delete({
      where: { id: chapterId },
    });

    return NextResponse.json({ message: "Đã xóa chương vĩnh viễn!" });
  } catch (error: any) {
    console.error("❌ Lỗi DELETE Chapter:", error);
    return NextResponse.json(
      { error: "Chương không tồn tại hoặc đã bị xóa trước đó" },
      { status: 500 }
    );
  }
}