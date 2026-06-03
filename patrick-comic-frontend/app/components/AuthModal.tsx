"use client";
import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, initialMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [formData, setFormData] = useState({ tenDangNhap: "", email: "", matKhau: "", adminCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Đồng bộ lại mode nếu prop initialMode thay đổi từ bên ngoài
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Reset lỗi khi chuyển chế độ
  useEffect(() => { setError(""); }, [mode]);

  // Đóng modal khi nhấn ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "login") {
      const res = await signIn("credentials", {
        tenDangNhap: formData.tenDangNhap,
        matKhau: formData.matKhau,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        router.refresh();
        onClose();
      }
    } else {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`, {
          method: "POST",
          body: JSON.stringify(formData),
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          alert("Đăng ký thành công! Hãy đăng nhập.");
          setMode("login");
        } else {
          const data = await res.json();
          setError(data.message || "Đăng ký thất bại");
        }
      } catch (err) {
        setError("Lỗi kết nối server!");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    // 🔥 Đã đổi từ z-[100] thành z-[10000] để đè lên menu mobile (z-[9999])
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 overflow-y-auto bg-black/40">
      
      {/* Overlay: Lớp nền mờ giống web phim */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-md bg-[#161b22] p-8 rounded-2xl shadow-2xl border border-gray-800 animate-in fade-in zoom-in duration-200 z-10 my-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">✕</button>
        
        <h2 className="text-3xl font-extrabold text-center text-blue-500 mb-2 uppercase tracking-tight">PATRICK COMIC</h2>
        <p className="text-gray-400 text-center mb-8 text-sm">
          {mode === "login" ? "Chào mừng ông quay trở lại!" : "Tạo tài khoản để trải nghiệm tốt nhất"}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg text-center font-medium">{error}</div>}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tên tài khoản</label>
            <input
              type="text"
              className="w-full p-3 rounded-xl bg-[#0d1117] border border-gray-700 text-white outline-none focus:border-blue-600 transition-all"
              value={formData.tenDangNhap}
              onChange={(e) => setFormData({ ...formData, tenDangNhap: e.target.value })}
              required
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email (Tùy chọn)</label>
              <input
                type="email"
                className="w-full p-3 rounded-xl bg-[#0d1117] border border-gray-700 text-white outline-none focus:border-blue-600 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Mật khẩu</label>
            <input
              type="password"
              className="w-full p-3 rounded-xl bg-[#0d1117] border border-gray-700 text-white outline-none focus:border-blue-600 transition-all"
              value={formData.matKhau}
              onChange={(e) => setFormData({ ...formData, matKhau: e.target.value })}
              required
            />
          </div>

          {mode === "register" && (
             <div className="pt-2">
                <label className="block text-[10px] font-bold text-yellow-600 uppercase mb-1">Mã ADMIN (Nếu có)</label>
                <input
                  type="password"
                  className="w-full p-3 rounded-xl bg-[#1a160d] border border-yellow-900/50 text-yellow-500 outline-none focus:border-yellow-600 transition-all"
                  value={formData.adminCode}
                  onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
                />
             </div>
          )}

          <button disabled={loading} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition-all active:scale-95 uppercase disabled:opacity-50">
            {loading ? "ĐANG XỬ LÝ..." : mode === "login" ? "ĐĂNG NHẬP NGAY" : "ĐĂNG KÝ NGAY"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <button 
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-gray-400 text-sm hover:text-blue-500 transition-colors"
          >
            {mode === "login" ? "Chưa có tài khoản? Tạo tài khoản mới" : "Đã có tài khoản? Đăng nhập ngay"}
          </button>
        </div>
      </div>
    </div>
  );
}