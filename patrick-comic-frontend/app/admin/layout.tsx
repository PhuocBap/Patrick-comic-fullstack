"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Thống kê", href: "/admin", icon: "📊" },
    { name: "Quản lý truyện", href: "/admin/stories", icon: "📚" },
    { name: "Người dùng", href: "/admin/users", icon: "👥" },
    { name: "Bình luận", href: "/admin/comments", icon: "💬" },
    { name: "Báo lỗi", href: "/admin/reports", icon: "⚠️" },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505] text-white font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-gray-800/50 p-6 fixed h-full bg-[#080808]/80 backdrop-blur-md z-50 flex flex-col justify-between">
        <div>
          <div className="mb-10 px-2">
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400 font-black text-2xl tracking-tighter uppercase">
              Patrick Admin
            </h2>
            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase mt-1">Hệ thống quản trị v1.0</p>
          </div>
          
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 group ${
                    isActive 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]" 
                    : "text-gray-500 hover:bg-[#111] hover:text-gray-200"
                  }`}
                >
                  <span className={`text-lg ${isActive ? "opacity-100" : "opacity-50 group-hover:opacity-100"}`}>{item.icon}</span>
                  <span className="text-sm font-bold tracking-tight">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* NÚT TRỞ VỀ TRANG CHỦ WEB TRUYỆN */}
        <div className="pt-6 border-t border-gray-800/50">
          <Link 
            href="/" 
            className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white hover:text-black hover:border-white transition-all duration-500 group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">🏠</span>
            <span className="text-xs font-black uppercase tracking-widest">Về trang chủ Web</span>
          </Link>
          <p className="text-[9px] text-center text-gray-600 mt-4 font-medium uppercase tracking-tighter">
            © 2026 PATRICKCOMIC
          </p>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 ml-72 p-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/5 via-[#050505] to-[#050505]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}