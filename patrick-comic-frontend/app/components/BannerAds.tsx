"use client";
import { useEffect, useState } from "react";

const ADS_CAMPAIGNS = [
  {
    name: "Alime",
    clickUrl: "https://fptshop.com.vn/tin-tuc/thu-thuat/100-anh-anime-cute-179788",
    imageUrl: "https://cdn2.fptshop.com.vn/unsafe/800x0/anh_anime_cute_02_28c4840cf0.jpg"
  },
  {
    name: "Anime",
    clickUrl: "https://fptshop.com.vn/tin-tuc/thu-thuat/100-anh-anime-cute-179788",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBj7BE9IpggNjuO4NJfeZh5Hmx1ia_-LCVqg&s" 
  }
];

export default function BannerAds() {
  const [currentAd, setCurrentAd] = useState<typeof ADS_CAMPAIGNS[0] | null>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * ADS_CAMPAIGNS.length);
    setCurrentAd(ADS_CAMPAIGNS[randomIndex]);
  }, []);

  if (!currentAd) return <div className="w-full h-24 my-2 bg-transparent" />;

  return (
    <div className="w-full my-4 mx-auto overflow-hidden rounded-2xl shadow-2xl border border-gray-800/80 hover:border-blue-600/50 transition-all select-none bg-gradient-to-r from-black via-[#0d0d0d] to-black">
      <a 
        href={currentAd.clickUrl} 
        target="_blank" 
        rel="nofollow noopener noreferrer"
        className="block w-full h-full relative group"
      >
        {/* Lớp phủ light effect khi hover qua cho chuyên nghiệp */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none" />
        
        <img 
          src={currentAd.imageUrl} 
          alt={`Quảng cáo ${currentAd.name}`} 
          // 🔥 ĐÃ CẬP NHẬT: Thay object-contain thành object-cover để phủ kín chiều ngang, tăng chiều cao tối đa lên một chút cho dễ nhìn
          className="w-full h-[90px] sm:h-[120px] md:h-[140px] object-cover block transition-transform duration-500 group-hover:scale-[1.01]" 
        />
      </a>
    </div>
  );
}