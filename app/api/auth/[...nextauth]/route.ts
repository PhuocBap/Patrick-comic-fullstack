import NextAuth, { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

// Mở rộng kiểu dữ liệu cho Session để không bị báo đỏ ở Frontend khi gọi session.user.role
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"]
  }

  interface User {
    vaiTro: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        tenDangNhap: { label: "Tên đăng nhập", type: "text" },
        matKhau: { label: "Mật khẩu", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.tenDangNhap || !credentials?.matKhau) {
          throw new Error("Vui lòng nhập đầy đủ thông tin");
        }

        const user = await prisma.nguoiDung.findUnique({
          where: { tenDangNhap: credentials.tenDangNhap }
        });

        if (!user) {
          throw new Error("Tài khoản không tồn tại");
        }

        const isPasswordValid = await bcrypt.compare(credentials.matKhau, user.matKhau);
        
        if (!isPasswordValid) {
          throw new Error("Mật khẩu không chính xác");
        }

        // Trả về object khớp với User interface
        return {
          id: user.id.toString(),
          name: user.tenDangNhap,
          email: user.email,
          vaiTro: user.vaiTro, 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.vaiTro; 
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; 
      }
      return session;
    }
  },
  pages: { 
    signIn: "/login",
    error: "/login", // Đưa về trang login nếu có lỗi auth
  },
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 ngày
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Hiện lỗi chi tiết trong console khi dev
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };