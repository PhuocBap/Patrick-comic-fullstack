import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

// --- HÀM LẤY DANH SÁCH BÌNH LUẬN ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const truyenId = searchParams.get("truyenId");

    if (!truyenId) {
      return NextResponse.json({ success: false, message: "Thiếu ID truyện" }, { status: 400 });
    }

    const comments = await prisma.binhLuan.findMany({
      where: { truyenId: Number(truyenId) },
      include: {
        nguoiDung: {
          select: { tenDangNhap: true } 
        }
      },
      // FIX LỖI: Kiểm tra lại tên cột ngày trong schema.prisma của ông (createdAt hoặc ngayTao)
      orderBy: { id: "desc" } 
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error) {
    console.error("Lỗi GET comments:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// --- HÀM GỬI BÌNH LUẬN ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Vui lòng đăng nhập!" }, { status: 401 });
    }

    const body = await req.json();
    const { noiDung, truyenId, chuongId } = body;

    const newComment = await prisma.binhLuan.create({
      data: {
        noiDung: noiDung.trim(),
        truyenId: Number(truyenId),
        chuongId: chuongId ? Number(chuongId) : null, 
        nguoiDungId: (session.user as any).id 
      },
      include: {
        nguoiDung: { select: { tenDangNhap: true } }
      }
    });

    return NextResponse.json({ success: true, data: newComment });
  } catch (error: any) {
    console.error("Lỗi POST comment:", error);
    return NextResponse.json({ success: false, message: "Lỗi lưu database" }, { status: 500 });
  }
}