import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../app/api/auth/[...nextauth]/route"; // Kiểm tra lại đường dẫn này
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Lấy session để biết thằng nào đang đăng nhập
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: "Fen chưa đăng nhập mà!" }, { status: 401 });
    }

    const { truyenId } = await req.json();
    // 2. Ép kiểu truyenId sang Number vì trong Schema ông để là Int
    const numericTruyenId = Number(truyenId);
    // Lấy ID người dùng từ session (ID này chắc chắn tồn tại trong DB)
    const nguoiDungId = session.user.id; 

    // 3. Kiểm tra xem đã theo dõi chưa
    const existingFollow = await prisma.theoDoi.findUnique({
      where: {
        nguoiDungId_truyenId: {
          nguoiDungId: nguoiDungId,
          truyenId: numericTruyenId,
        },
      },
    });

    if (existingFollow) {
      // Nếu có rồi thì bỏ theo dõi (Delete)
      await prisma.theoDoi.delete({
        where: { id: existingFollow.id },
      });
      return NextResponse.json({ followed: false, message: "Đã bỏ theo dõi" });
    } else {
      // 4. Nếu chưa có thì thêm mới (Chỗ này sẽ không bị lỗi P2003 nữa)
      await prisma.theoDoi.create({
        data: {
          nguoiDungId: nguoiDungId,
          truyenId: numericTruyenId,
        },
      });
      return NextResponse.json({ followed: true, message: "Theo dõi thành công" });
    }
  } catch (error) {
    console.error("Lỗi Follow API:", error);
    return NextResponse.json({ message: "Lỗi hệ thống rồi fen ơi!" }, { status: 500 });
  }
}