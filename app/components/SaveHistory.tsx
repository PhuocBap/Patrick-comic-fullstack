"use client";
import { useEffect } from "react";

export default function SaveHistory({ truyenId, chuongId }: { truyenId: number; chuongId: number }) {
  useEffect(() => {
    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ truyenId, chuongId }),
    }).catch((err) => console.error("Failed to save history", err));
  }, [truyenId, chuongId]);

  return null; // Component này không hiển thị gì cả
}