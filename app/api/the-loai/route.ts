import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const theLoais = await prisma.theLoai.findMany();
  return NextResponse.json(theLoais);
}