import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ChuongRepository } from '../repositories/chuong.repository';

@Injectable()
export class ChuongService {
  constructor(private readonly chuongRepo: ChuongRepository) {}

  async findChapterBySlugAndNumber(slug: string, soChuong: number) {
    const truyen = await this.chuongRepo.findTruyenBySlug(slug);
    if (!truyen) throw new NotFoundException('Không tìm thấy truyện với slug này');

    // Chuyển đổi an toàn, giữ nguyên số thực (Float) truyền từ Controller (đã dùng parseFloat)
    const parsedSoChuong = Number(soChuong);
    if (isNaN(parsedSoChuong)) {
      throw new BadRequestException('Số chương không hợp lệ');
    }

    const chuong = await this.chuongRepo.findChapterByNumberAndTruyenId(parsedSoChuong, truyen.id);
    if (!chuong) throw new NotFoundException(`Truyện không có chương số ${soChuong}`);

    // Kích hoạt hàm tăng view ngầm từ Repository
    await this.chuongRepo.incrementTruyenViewRaw(truyen.id);

    return chuong;
  }

  async findOne(id: number) {
    const chapterId = Number(id);
    if (isNaN(chapterId)) {
      throw new BadRequestException('ID chương không hợp lệ');
    }

    const chuong = await this.chuongRepo.findById(chapterId);
    if (!chuong) throw new NotFoundException('Không tìm thấy chương');
    return chuong;
  }

  // 🔥 ĐÃ CẬP NHẬT LOGIC: Chặn hoàn toàn NaN từ Client gửi lên để bảo vệ cột Float của Database
  async createChuong(data: { tenChuong?: string; soChuong: number; noiDung: string; truyenId: number }) {
    // 1. Kiểm tra và validate kiểu dữ liệu số thực (Float) của soChuong
    const parsedSoChuong = Number(data.soChuong);
    if (isNaN(parsedSoChuong)) {
      throw new BadRequestException('Số chương phải là một số hợp lệ (ví dụ: 1 hoặc 1.1)');
    }

    const parsedTruyenId = Number(data.truyenId);
    if (isNaN(parsedTruyenId)) {
      throw new BadRequestException('ID truyện không hợp lệ');
    }

    try {
      const tenChuongClean = data.tenChuong && data.tenChuong.trim() !== "" ? data.tenChuong.trim() : "";

      return await this.chuongRepo.create({
        tenChuong: tenChuongClean,
        soChuong: parsedSoChuong, // Dữ liệu an toàn không lo NaN
        noiDung: data.noiDung, 
        truyenId: parsedTruyenId,
      });
    } catch (error) {
      // Giữ nguyên logic catch lỗi cũ của bạn, không làm ảnh hưởng luồng Crawl
      throw new BadRequestException('Lỗi: Số chương có thể đã tồn tại hoặc ID truyện không chính xác.');
    }
  }

  async updateChapter(id: number, data: any) {
    const chapterId = Number(id);
    if (isNaN(chapterId)) {
      throw new BadRequestException('ID chương không hợp lệ');
    }

    // Kiểm tra tính hợp lệ của số chương nếu client có truyền lên để cập nhật
    let parsedSoChuong: number | undefined = undefined;
    if (data.soChuong !== undefined) {
      parsedSoChuong = Number(data.soChuong);
      if (isNaN(parsedSoChuong)) {
        throw new BadRequestException('Số chương cập nhật phải là số hợp lệ');
      }
    }

    try {
      const existing = await this.chuongRepo.findById(chapterId);
      if (!existing) throw new NotFoundException('Chương không tồn tại');

      return await this.chuongRepo.update(chapterId, {
        tenChuong: data.tenChuong !== undefined ? (data.tenChuong && data.tenChuong.trim() !== "" ? data.tenChuong.trim() : "") : undefined,
        noiDung: data.noiDung,
        soChuong: parsedSoChuong, // Nếu undefined thì Prisma sẽ tự bỏ qua không update trường này
        ngayCapNhat: new Date(),
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Không thể cập nhật dữ liệu vào Database.");
    }
  }

  async deleteChapter(id: number) {
    const chapterId = Number(id);
    if (isNaN(chapterId)) {
      throw new BadRequestException('ID chương không hợp lệ');
    }

    try {
      const chapter = await this.chuongRepo.findById(chapterId);
      if (!chapter) throw new NotFoundException('Chương không tồn tại');

      await this.chuongRepo.delete(chapterId);
      return { message: 'Xóa thành công' };
    } catch (error: any) {
      // Giữ nguyên để bắt các lỗi khóa ngoại phát sinh (nếu có)
      if (error.code === 'P2003') {
        throw new BadRequestException("Lỗi khóa ngoại: Hãy chắc chắn đã cấu hình 'onDelete: Cascade' trong schema.");
      }
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Lỗi server khi xóa chương.");
    }
  }
}