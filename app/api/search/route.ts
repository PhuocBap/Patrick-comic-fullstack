import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// Hàm chuẩn hóa tiếng Việt chuẩn
function removeVietnameseTones(str: string) {
    if (!str) return "";
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'd') 
        .toLowerCase()
        .replace(/\s+/g, ' ') 
        .trim();
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";
        const trimmedQuery = query.trim();

        if (!trimmedQuery) return NextResponse.json([]);

        const searchSafe = removeVietnameseTones(trimmedQuery);

        const truyen = await prisma.truyen.findMany({
            where: {
                OR: [
                    // Tìm trong tên không dấu (cần index trong schema để nhanh hơn)
                    { tenKhongDau: { contains: searchSafe } },
                    // Tìm trong tên gốc có dấu
                    { tenTruyen: { contains: trimmedQuery } },
                    // Tìm theo tác giả
                    { tacGia: { contains: trimmedQuery } },
                ],
            },
            select: {
                id: true,
                tenTruyen: true,
                thumbnail: true, // Đã khớp với schema mới
                tacGia: true,
                slug: true
            },
            take: 10, // Giới hạn 10 kết quả cho gợi ý
        });
        
        return NextResponse.json(truyen);
    } catch (error) {
        console.error("Search API Error:", error);
        // Luôn trả về mảng rỗng khi lỗi để frontend không bị crash
        return NextResponse.json([]); 
    }
}