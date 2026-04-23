import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; 
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenDangNhap, matKhau, email, adminCode } = body;

    // 1. Kiểm tra đầu vào
    if (!tenDangNhap || !matKhau) {
      return NextResponse.json(
        { message: "Tên đăng nhập và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    // 2. Kiểm tra trùng lặp (Khớp với model NguoiDung)
    const userExists = await prisma.nguoiDung.findFirst({
      where: {
        OR: [
          { tenDangNhap: tenDangNhap },
          ...(email ? [{ email: email }] : []),
        ],
      },
    });

    if (userExists) {
      const field = userExists.tenDangNhap === tenDangNhap ? "Tên đăng nhập" : "Email";
      return NextResponse.json(
        { message: `${field} đã được sử dụng` },
        { status: 409 }
      );
    }

    // 3. Hash mật khẩu
    const hashedPassword = await bcrypt.hash(matKhau, 10);

    // 4. Kiểm tra mã Admin
    const ADMIN_SECRET = "phuoc_admin_123"; 
    const finalRole = adminCode === ADMIN_SECRET ? "ADMIN" : "USER";

    // 5. Tạo người dùng mới
    const newUser = await prisma.nguoiDung.create({
      data: {
        tenDangNhap: tenDangNhap.trim(),
        matKhau: hashedPassword,
        email: email ? email.trim() : null,
        vaiTro: finalRole,
      },
    });

    // 6. Trả về thành công (Loại bỏ mật khẩu khỏi dữ liệu trả về)
    const { matKhau: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(
      { 
        message: finalRole === "ADMIN" ? "Đăng ký thành công tài khoản ADMIN!" : "Đăng ký thành công!", 
        user: userWithoutPassword 
      }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      { message: "Có lỗi xảy ra khi tạo tài khoản" },
      { status: 500 }
    );
  }
}