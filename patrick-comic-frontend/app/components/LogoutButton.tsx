"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/" })} // Đăng xuất xong đá về trang chủ
      className="text-xs bg-gray-700 hover:bg-red-900/40 hover:text-red-400 text-gray-400 px-3 py-1 rounded transition-colors border border-gray-600"
    >
      Thoát
    </button>
  );
}