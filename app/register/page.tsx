"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ 
    tenDangNhap: "", 
    email: "", 
    matKhau: "",
    adminCode: "" // Trường này giờ là tùy chọn
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        alert("Đăng ký thành công! Đang chuyển hướng tới trang đăng nhập...");
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setError("Có lỗi kết nối, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 font-sans">
      <div className="max-w-md w-full bg-[#161b22] p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-3xl font-extrabold text-center text-blue-500 mb-2 uppercase tracking-tight">
          PATRIC COMIC
        </h2>
        <p className="text-gray-400 text-center mb-8 text-sm">Tạo tài khoản để trải nghiệm tốt nhất</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center animate-pulse">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Tên tài khoản</label>
            <input
              type="text"
              placeholder="Tên đăng nhập..."
              className="w-full p-3 rounded-xl bg-[#0d1117] border border-gray-700 text-white outline-none focus:border-blue-600 transition-all"
              onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Email (Không bắt buộc)</label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full p-3 rounded-xl bg-[#0d1117] border border-gray-700 text-white outline-none focus:border-blue-600 transition-all"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 rounded-xl bg-[#0d1117] border border-gray-700 text-white outline-none focus:border-blue-600 transition-all"
              onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
              required
            />
          </div>

          {/* Ô NHẬP MÃ ADMIN BÍ MẬT - ĐÃ BỎ REQUIRED */}
          <div className="pt-2">
            <label className="block text-[10px] font-bold text-yellow-600 uppercase mb-1 ml-1">
              Mã xác nhận ADMIN (Nếu có)
            </label>
            <input
              type="password"
              placeholder="Bỏ trống nếu là người dùng thường..."
              className="w-full p-3 rounded-xl bg-[#1a160d] border border-yellow-900/50 text-yellow-500 placeholder-yellow-900/30 outline-none focus:border-yellow-600 transition-all"
              onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
              // Không có thuộc tính required ở đây để User không bị bắt lỗi
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full mt-4 ${loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'} text-white py-4 rounded-xl font-bold transition-all active:scale-[0.98] uppercase shadow-lg`}
          >
            {loading ? "ĐANG TẠO TÀI KHOẢN..." : "ĐĂNG KÝ NGAY"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-blue-500 font-semibold hover:text-blue-400">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  ); 
}