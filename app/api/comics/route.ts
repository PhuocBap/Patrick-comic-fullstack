import { NextResponse } from "next/server";
import { getLatestComics } from "../../../controllers/truyen.controller"; // Kiểm tra lại đường dẫn @ hoặc ../

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const skip = parseInt(searchParams.get("skip") || "0");
  const take = parseInt(searchParams.get("take") || "12");

  try {
    const comics = await getLatestComics(skip, take);
    return NextResponse.json(comics);
  } catch (error) {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}