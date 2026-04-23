"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";
import SearchBar from "./SearchBar";

export default function Header() {
  const { data: session } = useSession();
  const [theLoais, setTheLoais] = useState<{ id: string | number; ten: string }[]>([]);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    fetch("/api/the-loai")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          // Sắp xếp thể loại theo tên cho đẹp
          setTheLoais(data.sort((a, b) => a.ten.localeCompare(b.ten)));
        }
      })
      .catch((err) => console.error("Lỗi lấy thể loại:", err));
  }, []);

  return (
    <header className="bg-[#1a1a1a] border-b border-gray-700 py-3 sticky top-0 z-[9999] shadow-2xl">
      <div className="container mx-auto px-4 flex items-center justify-between gap-4 relative">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="bg-blue-600 text-white p-1 rounded font-black text-xl italic leading-none group-hover:bg-blue-500 transition">P</div>
          <span className="text-xl font-bold tracking-tighter text-white">
            PATRIC<span className="text-blue-500">COMIC</span>
          </span>
        </Link>

        {/* SEARCH BOX */}
        <div className="flex-1 max-w-[350px]">
          <SearchBar />
        </div>

        {/* NAVIGATION */}
        <nav className="flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wide flex-shrink-0">
          <Link href="/" className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition whitespace-nowrap">
            Trang chủ
          </Link>

          {/* THỂ LOẠI DROPDOWN */}
          <div className="group relative flex items-center h-full">
            <button className="px-4 py-2 text-gray-300 group-hover:text-white group-hover:bg-[#333] rounded-t-md transition-all duration-200 flex items-center gap-1 uppercase font-bold text-[13px]">
              Thể loại <span className="text-[10px] opacity-50 group-hover:rotate-180 transition-transform">▼</span>
            </button>
            
            <div className="absolute top-full -left-20 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 z-[9999] pt-2">
              <div className="h-2 w-full bg-transparent"></div>
              <div className="bg-[#1a1a1a] border border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,1)] w-[550px] p-6 rounded-b-lg rounded-tr-lg">
                <div className="mb-4 flex items-center gap-2 border-l-4 border-blue-600 pl-3">
                  <span className="text-white text-[11px] font-black uppercase tracking-[0.2em]">Khám phá thể loại</span>
                </div>

                <div className="grid grid-cols-3 gap-x-6 gap-y-1">
                  {theLoais && theLoais.length > 0 ? (
                    theLoais.map((tl) => (
                      <Link
                        key={tl.id}
                        href={`/the-loai/${tl.id}`}
                        className="group/item text-[#999] hover:text-white hover:bg-blue-600/10 px-2 py-2 rounded transition-all duration-200 flex items-center border-b border-gray-800/50"
                      >
                        <span className="text-blue-500 mr-2 font-bold opacity-0 group-hover/item:opacity-100 transition-opacity">#</span>
                        <span className="truncate text-[13px] font-medium">{tl.ten}</span>
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-full text-center py-4 italic">Đang tải dữ liệu...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* NÚT LỊCH SỬ - MỚI CẬP NHẬT */}
          <Link href="/history" className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition whitespace-nowrap">
            Lịch sử
          </Link>

          <Link href="/theo-doi" className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition whitespace-nowrap">
            Theo dõi
          </Link>

          {isAdmin && (
            <Link href="/admin/them-truyen" className="px-3 py-2 text-yellow-500 hover:text-yellow-400 transition whitespace-nowrap border border-yellow-500/30 rounded mx-1 animate-pulse font-bold">
              ADMIN
            </Link>
          )}

          {/* USER INFO */}
          <div className="flex items-center gap-3 border-l border-gray-700 ml-2 pl-4">
            {session ? (
              <div className="flex items-center gap-3 whitespace-nowrap">
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-blue-400 font-bold lowercase italic text-[14px]">
                    @{session.user.name || "user"}
                  </span>
                  <span className="text-[9px] text-gray-500 font-black">
                    {isAdmin ? "QUẢN TRỊ VIÊN" : "THÀNH VIÊN"}
                  </span>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Link href="/login" className="px-3 py-1.5 text-gray-300 hover:text-white transition">Đăng nhập</Link>
                <Link href="/register" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition">Đăng ký</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}