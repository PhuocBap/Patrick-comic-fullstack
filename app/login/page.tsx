"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [tenDangNhap, setTenDangNhap] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      tenDangNhap,
      matKhau,
      redirect: false, // Để mình tự xử lý chuyển hướng
    });

    if (res?.error) {
      setError("Tài khoản hoặc mật khẩu không chính xác!");
      setLoading(false);
    } else {
      // Đăng nhập thành công
      router.push("/"); 
      // Ép trình duyệt load lại để Header cập nhật quyền Admin/User
      setTimeout(() => {
        router.refresh();
      }, 150);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 font-sans">
      <div className="max-w-md w-full bg-[#161b22] p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-3xl font-extrabold text-center text-blue-500 mb-2 uppercase tracking-tight">
          PATRIC COMIC
        </h2>
        <p className="text-gray-400 text-center mb-8 text-sm">Chào mừng ông quay trở lại!</p>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center animate-bounce">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Tên tài khoản</label>
            <input
              type="text"
              placeholder="Nhập tên đăng nhập..."
              className="w-full p-3.5 rounded-xl bg-[#0d1117] border border-gray-700 text-white outline-none focus:border-blue-600 transition-all placeholder:text-gray-600"
              value={tenDangNhap}
              onChange={(e) => setTenDangNhap(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3.5 rounded-xl bg-[#0d1117] border border-gray-700 text-white outline-none focus:border-blue-600 transition-all placeholder:text-gray-600"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              required
            />
          </div>

          <button 
            disabled={loading}
            className={`w-full ${loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 uppercase transition-transform active:scale-95`}
          >
            {loading ? "ĐANG XÁC THỰC..." : "ĐĂNG NHẬP NGAY"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-blue-500 font-semibold hover:text-blue-400">Tạo tài khoản mới</Link>
          </p>
        </div>
      </div>
    </div>
  );
}