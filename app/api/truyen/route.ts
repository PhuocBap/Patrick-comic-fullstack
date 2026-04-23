import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const slugify = (str: string) => {
  return str.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').replace(/([^0-9a-z-\s])/g, '').replace(/(\s+)/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
};

const removeVietnameseTones = (str: string) => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().trim();
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 12;
    const skip = (page - 1) * limit;

    const [truyens, total] = await Promise.all([
      prisma.truyen.findMany({
        skip: skip,
        take: limit,
        orderBy: { id: "desc" }, // Sắp xếp theo ID giảm dần như bạn muốn ở câu hỏi trước
      }),
      prisma.truyen.count(),
    ]);

    return NextResponse.json({
      data: truyens,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Từ chối truy cập!" }, { status: 403 });
    }

    const body = await req.json();
    const { ten, thumbnail, trangThai, tacGia, moTa, theLoaiIds, tenKhongDauManual, slug } = body;

    // Kiểm tra dữ liệu bắt buộc
    if (!ten || !thumbnail) {
      return NextResponse.json({ message: "Vui lòng nhập tên và link ảnh bìa!" }, { status: 400 });
    }

    const truyenMoi = await prisma.truyen.create({
      data: {
        tenTruyen: ten,
        tenKhongDau: tenKhongDauManual || removeVietnameseTones(ten),
        thumbnail: thumbnail, 
        tacGia: tacGia || "Đang cập nhật",
        moTa: moTa || "",
        trangThai: trangThai || "DANG_RA",
        slug: slug || slugify(ten),
        theLoais: theLoaiIds && theLoaiIds.length > 0 ? {
          connect: theLoaiIds.map((id: string) => ({ id }))
        } : undefined
      }
    });

    return NextResponse.json({ message: "Thêm truyện thành công!", data: truyenMoi }, { status: 201 });
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json({ message: "Lỗi Server", error: error.message }, { status: 500 });
  }
}