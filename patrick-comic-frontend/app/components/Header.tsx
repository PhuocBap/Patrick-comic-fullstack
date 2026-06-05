"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import SearchBar from "./SearchBar";
import AuthModal from "./AuthModal";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [theLoais, setTheLoais] = useState<{ id: string | number; ten: string }[]>([]);
  
  // State quản lý việc đóng mở menu trên mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: "login" | "register" }>({
    isOpen: false,
    mode: "login",
  });

  const isAdmin = session?.user?.role === "ADMIN";

  // Tự động đóng menu mobile khi người dùng chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return;

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/the-loai`)
      .then((res) => {
        if (!res.ok) throw new Error(`Lỗi HTTP: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTheLoais(data.sort((a, b) => a.ten.localeCompare(b.ten)));
        }
      })
      .catch((err) => console.error("Lỗi lấy thể loại:", err));
  }, []);

  // 🔥 Hàm xử lý bật Modal và tự động đóng luôn Menu Mobile
  const handleOpenAuthModal = (mode: "login" | "register") => {
    setAuthModal({ isOpen: true, mode });
    setIsMobileMenuOpen(false); // Đóng menu mobile ngay lập tức để không che khuất Modal
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky t-0 bg-[#1a1a1a] border-b border-gray-700 py-3 sticky top-0 z-[9999] shadow-2xl">
      <div className="container mx-auto px-4 flex items-center justify-between gap-4 relative">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="bg-blue-600 text-white p-1 rounded font-black text-xl italic leading-none group-hover:bg-blue-500 transition">P</div>
          <span className="text-xl font-bold tracking-tighter text-white uppercase">
            PATRICK<span className="text-blue-500">COMIC</span>
          </span>
        </Link>

        {/* SEARCH BOX */}
        <div className="flex-1 max-w-[350px]">
          <SearchBar />
        </div>

        {/* BUTTON TOGGLE MENU (CHỈ HIỆN TRÊN MOBILE VÀ TABLET) */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="xl:hidden p-2 text-gray-400 hover:text-white rounded bg-gray-800/50 transition-all"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* NAVIGATION CHO DESKTOP */}
        <nav className="hidden xl:flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wide flex-shrink-0">
          <Link 
            href="/" 
            className={`px-3 py-2 rounded transition whitespace-nowrap ${isActive('/') ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
          >
            Trang chủ
          </Link>

          {/* DANH SÁCH DROPDOWN */}
          <div className="group relative flex items-center h-full">
            <button className="px-4 py-2 text-gray-300 group-hover:text-white group-hover:bg-[#333] rounded-t-md transition-all duration-200 flex items-center gap-1 uppercase font-bold text-[13px]">
              Danh sách <span className="text-[10px] opacity-50 group-hover:rotate-180 transition-transform">▼</span>
            </button>
            
            <div className="absolute top-full left-0 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 z-[9999] pt-2">
              <div className="h-2 w-full bg-transparent"></div>
              <div className="bg-[#1a1a1a] border border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,1)] w-[180px] rounded-b-lg rounded-tr-lg overflow-hidden">
                <div className="flex flex-col">
                  <Link href="/danh-sach/sap-ra-mat" className="px-4 py-3 text-[#999] hover:text-white hover:bg-blue-600 transition-all font-medium text-[13px] border-b border-gray-800/50 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>  Sắp Ra Mắt
                  </Link>
                  <Link href="/danh-sach/hoan-thanh" className="px-4 py-3 text-[#999] hover:text-white hover:bg-blue-600 transition-all font-medium text-[13px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Đã hoàn thành
                  </Link>
                </div>
              </div>
            </div>
          </div>

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
                
                <div className="max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="grid grid-cols-3 gap-x-6 gap-y-1">
                    {theLoais.length > 0 ? (
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
          </div>

          {/* XẾP HẠNG DROPDOWN */}
          <div className="group relative flex items-center h-full">
            <button className="px-4 py-2 text-gray-300 group-hover:text-white group-hover:bg-[#333] rounded-t-md transition-all duration-200 flex items-center gap-1 uppercase font-bold text-[13px]">
              Xếp hạng <span className="text-[10px] opacity-50 group-hover:rotate-180 transition-transform">▼</span>
            </button>
            
            <div className="absolute top-full left-0 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 z-[9999] pt-2">
              <div className="h-2 w-full bg-transparent"></div>
              <div className="bg-[#1a1a1a] border border-gray-700 shadow-[0_20px_50px_rgba(0,0,0,1)] w-[180px] rounded-b-lg rounded-tr-lg overflow-hidden">
                <div className="flex flex-col">
                  <Link href="/xep-hang?top=ngay" className="px-4 py-3 text-[#999] hover:text-white hover:bg-blue-600 transition-all font-medium text-[13px] border-b border-gray-800/50 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Top Ngày
                  </Link>
                  <Link href="/xep-hang?top=tuan" className="px-4 py-3 text-[#999] hover:text-white hover:bg-blue-600 transition-all font-medium text-[13px] border-b border-gray-800/50 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Top Tuần
                  </Link>
                  <Link href="/xep-hang?top=thang" className="px-4 py-3 text-[#999] hover:text-white hover:bg-blue-600 transition-all font-medium text-[13px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Top Tháng
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <Link 
            href="/history" 
            className={`px-3 py-2 rounded transition whitespace-nowrap ${isActive('/history') ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
          >
            Lịch sử
          </Link>

          <Link 
            href="/theo-doi" 
            className={`px-3 py-2 rounded transition whitespace-nowrap ${isActive('/theo-doi') ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
          >
            Theo dõi
          </Link>

          {isAdmin && (
            <Link href="/admin/them-truyen" className="px-3 py-2 text-yellow-500 hover:text-yellow-400 transition whitespace-nowrap border border-yellow-500/30 rounded mx-1 animate-pulse font-bold">
              ADMIN
            </Link>
          )}

          {/* USER INFO & AUTH DESKTOP */}
          <div className="flex items-center gap-3 border-l border-gray-700 ml-2 pl-4">
            {session ? (
              <div className="flex items-center gap-3 whitespace-nowrap">
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-blue-400 font-bold lowercase italic text-[14px]">
                    @{session.user?.name || "user"}
                  </span>
                  <span className="text-[9px] text-gray-500 font-black">
                    {isAdmin ? "QUẢN TRỊ VIÊN" : "THÀNH VIÊN"}
                  </span>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <button 
                  onClick={() => handleOpenAuthModal("login")}
                  className="px-3 py-1.5 text-gray-300 hover:text-white transition font-bold"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => handleOpenAuthModal("register")}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition shadow-lg shadow-blue-900/20"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* MOBILE NAVIGATION MENU */}
      {isMobileMenuOpen && (
        <div className="xl:hidden w-full bg-[#1e1e1e] border-t border-gray-800 mt-3 px-4 py-4 absolute left-0 right-0 top-full shadow-2xl z-[9999] flex flex-col gap-2">
          <Link 
            href="/" 
            className={`px-4 py-2.5 rounded text-sm font-semibold uppercase ${isActive('/') ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white bg-gray-900/40'}`}
          >
            Trang chủ
          </Link>
          
          <Link 
            href="/history" 
            className={`px-4 py-2.5 rounded text-sm font-semibold uppercase ${isActive('/history') ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white bg-gray-900/40'}`}
          >
            Lịch sử
          </Link>

          <Link 
            href="/theo-doi" 
            className={`px-4 py-2.5 rounded text-sm font-semibold uppercase ${isActive('/theo-doi') ? 'text-white bg-gray-700' : 'text-gray-300 hover:text-white bg-gray-900/40'}`}
          >
            Theo dõi
          </Link>

          <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-gray-800">
            <Link href="/danh-sach/sap-ra-mat" className="p-2 text-xs text-gray-400 bg-gray-900/60 rounded text-center">Sắp Ra Mắt</Link>
            <Link href="/danh-sach/hoan-thanh" className="p-2 text-xs text-gray-400 bg-gray-900/60 rounded text-center">Đã Hoàn Thành</Link>
            <Link href="/xep-hang?top=ngay" className="p-2 text-xs text-gray-400 bg-gray-900/60 rounded text-center">Top Ngày</Link>
            <Link href="/xep-hang?top=tuan" className="p-2 text-xs text-gray-400 bg-gray-900/60 rounded text-center">Top Tuần</Link>
          </div>

          {isAdmin && (
            <Link href="/admin/them-truyen" className="mt-2 p-2 text-center text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded font-bold">
              Khu vực ADMIN
            </Link>
          )}

          {/* PHẦN AUTHENTICATION TRÊN MOBILE */}
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
            {session ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="text-blue-400 font-bold text-sm">@{session.user?.name || "user"}</span>
                  <span className="text-[10px] text-gray-500">{isAdmin ? "QUẢN TRỊ VIÊN" : "THÀNH VIÊN"}</span>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full justify-end">
                <button 
                  onClick={() => handleOpenAuthModal("login")}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white font-bold"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => handleOpenAuthModal("register")}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AuthModal sẽ được render tách biệt sạch sẽ */}
      {authModal.isOpen && (
        <AuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ ...authModal, isOpen: false })}
          initialMode={authModal.mode}
        />
      )}
    </header>
  );
}