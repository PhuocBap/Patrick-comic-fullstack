import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma"; 
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Thêm adminCode vào để nhận dữ liệu từ giao diện gửi lên
    const { tenDangNhap, matKhau, email, adminCode } = body;

    // 1. Kiểm tra dữ liệu đầu vào cơ bản
    if (!tenDangNhap || !matKhau) {
      return NextResponse.json(
        { message: "Tên đăng nhập và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    // 2. Kiểm tra xem người dùng đã tồn tại chưa
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

    // 3. Băm mật khẩu (Hash password)
    const hashedPassword = await bcrypt.hash(matKhau, 10);

    // 4. KIỂM TRA MÃ ADMIN
    // Ông có thể đổi "phuoc_admin_123" thành bất cứ mã nào ông muốn
    const ADMIN_SECRET = "phuoc_admin_123"; 
    const finalRole = adminCode === ADMIN_SECRET ? "ADMIN" : "USER";

    // 5. Tạo người dùng mới trong Database
    const newUser = await prisma.nguoiDung.create({
      data: {
        tenDangNhap: tenDangNhap.trim(),
        matKhau: hashedPassword,
        email: email ? email.trim() : null,
        vaiTro: finalRole, // Gán vai trò dựa trên mã bí mật
      },
    });

    // 6. Trả về thông báo thành công
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