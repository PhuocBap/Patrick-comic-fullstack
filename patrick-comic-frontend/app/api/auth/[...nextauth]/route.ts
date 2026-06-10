import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        tenDangNhap: { label: "Username", type: "text" },
        matKhau: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 🔥 THÊM MỚI: Check chặn ngay từ frontend nếu object credentials bị rỗng hoặc thiếu trường khi NextAuth kích hoạt ngầm
        if (!credentials?.tenDangNhap || !credentials?.matKhau) {
          throw new Error("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!");
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/validate`, {
            method: 'POST',
            body: JSON.stringify({
              tenDangNhap: credentials.tenDangNhap,
              matKhau: credentials.matKhau
            }),
            headers: { "Content-Type": "application/json" }
          });

          const data = await res.json();

          // Nếu có lỗi từ phía Backend (Bao gồm cả sai thông tin hoặc bị KHÓA)
          if (!res.ok) {
            throw new Error(data.message || "Tài khoản hoặc mật khẩu không chính xác!");
          }

          if (data) {
            return {
              id: String(data.id), 
              name: data.tenDangNhap,
              email: data.email, 
              vaiTro: data.vaiTro
            }; 
          }
          return null;
        } catch (error: any) {
          throw new Error(error.message || "Tài khoản hoặc mật khẩu không chính xác!");
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email; 
        token.role = (user as any).vaiTro;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).email = token.email; 
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/", // Tránh tự động redirect về trang lỗi mặc định của NextAuth
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };