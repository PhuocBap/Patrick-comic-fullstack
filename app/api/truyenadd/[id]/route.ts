import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tenTruyen, tacGia, moTa, thumbnail, trangThai, theLoaiIds, tenKhongDau } = body;

    const updated = await prisma.truyen.update({
      where: { id: Number(id) },
      data: {
        tenTruyen,
        tacGia,
        moTa,
        thumbnail,
        trangThai,
        tenKhongDau: tenKhongDau,
        theLoais: theLoaiIds ? { 
          set: theLoaiIds.map((id: string) => ({ id })) 
        } : undefined
      },
      include: { theLoais: true } // Thêm dòng này để trả về đầy đủ data
    });

    return NextResponse.json({ message: "Thành công", data: updated });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}