// app/components/admin/AdminSidebar.tsx
import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="w-64 border-r border-gray-800 p-6 flex flex-col gap-8 bg-[#050505]">
      <div className="text-blue-500 font-black text-2xl tracking-tighter">
        PATRICK <span className="text-white">ADMIN</span>
      </div>
      
      <nav className="flex flex-col gap-2">
        <Link href="/admin" className="p-3 hover:bg-blue-600/10 rounded-xl transition-all text-gray-400 hover:text-blue-400 font-medium">
          📊 Thống kê tổng quan
        </Link>
        <Link href="/admin/stories" className="p-3 hover:bg-blue-600/10 rounded-xl transition-all text-gray-400 hover:text-blue-400 font-medium">
          📚 Quản lý truyện
        </Link>
        <Link href="/admin/users" className="p-3 hover:bg-blue-600/10 rounded-xl transition-all text-gray-400 hover:text-blue-400 font-medium">
          👥 Người dùng
        </Link>
        <Link href="/admin/reports" className="p-3 hover:bg-blue-600/10 rounded-xl transition-all text-gray-400 hover:text-blue-400 font-medium">
          ⚠️ Báo lỗi chương
        </Link>
      </nav>

      <div className="mt-auto border-t border-gray-800 pt-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-white transition-colors">
          ← Quay lại trang chủ
        </Link>
      </div>
    </aside>
  );
}