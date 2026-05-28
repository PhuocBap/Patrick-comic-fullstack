// src/service/theloai.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TheLoaiRepository } from '../repositories/theloai.repository';

@Injectable()
export class TheLoaiService {
  constructor(private readonly theLoaiRepo: TheLoaiRepository) {}

  // Lấy toàn bộ danh sách thể loại
  async getAllTheLoai() {
    return await this.theLoaiRepo.findAll();
  }

  // Lấy chi tiết thể loại kèm danh sách truyện và chương mới nhất
  async getTheLoaiById(id: string) {
    const theLoai = await this.theLoaiRepo.findById(id);

    if (!theLoai) {
      throw new NotFoundException(`Không tìm thấy thể loại`);
    }
    return theLoai;
  }

  // Tạo thể loại mới an toàn
  async createTheLoai(ten: string) {
    if (!ten || ten.trim() === '') {
      throw new BadRequestException('Tên thể loại không được để trống');
    }

    const tenTrimmed = ten.trim();

    // Dùng repository check trùng trực tiếp từ DB tối ưu hiệu năng
    const isExisting = await this.theLoaiRepo.findByName(tenTrimmed);
    
    if (isExisting) {
      throw new BadRequestException('Thể loại này đã tồn tại trong hệ thống');
    }

    return await this.theLoaiRepo.create(tenTrimmed);
  }

  // Xử lý logic xóa thể loại theo ID
  async deleteTheLoai(id: string) {
  const theLoai = await this.theLoaiRepo.findById(id);
  if (!theLoai) {
    throw new NotFoundException('Không tìm thấy thể loại để xóa');
  }

  try {
    return await this.theLoaiRepo.delete(id);
  } catch (error: any) {
    // Check mã lỗi ràng buộc khóa ngoại (Foreign Key) của Prisma với SQLite
    if (error.code === 'P2003') {
      throw new BadRequestException('Không thể xóa thể loại này vì đang có truyện thuộc thể loại này!');
    }
    throw error;
  }
}
}
