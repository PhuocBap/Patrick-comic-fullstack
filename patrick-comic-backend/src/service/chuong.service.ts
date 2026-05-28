import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ChuongRepository } from '../repositories/chuong.repository';

@Injectable()
export class ChuongService {
  constructor(private readonly chuongRepo: ChuongRepository) {}

  async findChapterBySlugAndNumber(slug: string, soChuong: number) {
    const truyen = await this.chuongRepo.findTruyenBySlug(slug);
    if (!truyen) throw new NotFoundException('Không tìm thấy truyện với slug này');

    const chuong = await this.chuongRepo.findChapterByNumberAndTruyenId(Number(soChuong), truyen.id);
    if (!chuong) throw new NotFoundException(`Truyện không có chương số ${soChuong}`);

    // Kích hoạt hàm tăng view ngầm từ Repository
    await this.chuongRepo.incrementTruyenViewRaw(truyen.id);

    return chuong;
  }

  async findOne(id: number) {
    const chuong = await this.chuongRepo.findById(Number(id));
    if (!chuong) throw new NotFoundException('Không tìm thấy chương');
    return chuong;
  }

  // 🔥 ĐÃ CẬP NHẬT LOGIC: Không sử dụng toán tử || để tránh nuốt chuỗi rỗng "" từ Client gửi lên
  async createChuong(data: { tenChuong?: string; soChuong: number; noiDung: string; truyenId: number }) {
    try {
      const tenChuongClean = data.tenChuong && data.tenChuong.trim() !== "" ? data.tenChuong.trim() : "";

      return await this.chuongRepo.create({
        tenChuong: tenChuongClean,
        soChuong: Number(data.soChuong),
        noiDung: data.noiDung, // Trường này nhận chuỗi stringified JSON chứa danh sách mảng link ảnh từ CrawlService
        truyenId: Number(data.truyenId),
      });
    } catch (error) {
      throw new BadRequestException('Lỗi: Số chương có thể đã tồn tại hoặc ID truyện không chính xác.');
    }
  }

  async updateChapter(id: number, data: any) {
    try {
      const chapterId = Number(id);
      const existing = await this.chuongRepo.findById(chapterId);
      if (!existing) throw new NotFoundException('Chương không tồn tại');

      return await this.chuongRepo.update(chapterId, {
        tenChuong: data.tenChuong !== undefined ? (data.tenChuong && data.tenChuong.trim() !== "" ? data.tenChuong.trim() : "") : undefined,
        noiDung: data.noiDung,
        soChuong: data.soChuong ? Number(data.soChuong) : undefined,
        ngayCapNhat: new Date(),
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Không thể cập nhật dữ liệu vào Database.");
    }
  }

  async deleteChapter(id: number) {
    try {
      const chapterId = Number(id);
      const chapter = await this.chuongRepo.findById(chapterId);
      if (!chapter) throw new NotFoundException('Chương không tồn tại');

      await this.chuongRepo.delete(chapterId);
      return { message: 'Xóa thành công' };
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException("Lỗi khóa ngoại: Hãy chắc chắn đã cấu hình 'onDelete: Cascade' trong schema.");
      }
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Lỗi server khi xóa chương.");
    }
  }
}