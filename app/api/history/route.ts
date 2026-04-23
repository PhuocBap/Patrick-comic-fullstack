import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { updateReadingHistory } from "../../../controllers/history.controller";
import { prisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { truyenId, chuongId } = await req.json();

    if (!truyenId || !chuongId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Tìm user ID từ email session
    const user = await prisma.nguoiDung.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const history = await updateReadingHistory(user.id, Number(truyenId), Number(chuongId));
    
    return NextResponse.json(history);
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}