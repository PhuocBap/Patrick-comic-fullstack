"use client";

import ComicCard from "./ComicCard";

interface ComicListProps {
  initialComics: any[];
  totalPages?: number; 
  currentPage?: number;
}

export default function ComicList({ initialComics }: ComicListProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {initialComics && initialComics.length > 0 ? (
        initialComics.map((comic) => (
          // comic ở đây sẽ chứa thêm field readingChapter từ page.tsx truyền vào
          <ComicCard key={comic.id} comic={comic} />
        ))
      ) : (
        <div className="col-span-full text-center py-20 text-gray-500 italic border border-dashed border-gray-800 rounded-xl">
          Không có dữ liệu truyện trong danh sách này.
        </div>
      )}
    </div>
  );
}