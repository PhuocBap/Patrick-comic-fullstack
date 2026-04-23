export default function Footer() {
  return (
    <footer className="bg-[#111] text-gray-400 py-8 mt-10 border-t border-gray-800">
      <div className="container mx-auto px-4">
        {/* Giới thiệu */}
        <div className="text-center mb-8 max-w-3xl mx-auto">
          <p className="text-sm leading-relaxed">
            <span className="font-bold text-white">PATRIC COMIC</span> là nền tảng đọc truyện tranh online miễn phí dành cho cộng đồng yêu thích manga, manhwa và manhua. Website tổng hợp kho truyện tranh khổng lồ, được cập nhật liên tục mỗi ngày với hình ảnh sắc nét, tốc độ tải nhanh.
          </p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm mb-8">
          <a href="#" className="hover:text-white transition">truyenpatrick</a>
          <a href="#" className="hover:text-white transition">patrick-comic</a>
          <a href="#" className="hover:text-white transition">phuocbap</a>
          <a href="#" className="hover:text-white transition">Liên hệ</a>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 flex flex-col items-center gap-2">
          <div className="text-xl font-black italic tracking-tighter text-white">
            <span className="text-blue-500">PATRIC</span> COMIC
          </div>
          <p className="text-xs">©2026 PATRIC COMIC</p>
        </div>
      </div>
    </footer>
  );
}