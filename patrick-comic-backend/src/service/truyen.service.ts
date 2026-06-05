import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TruyenRepository } from '../repositories/truyen.repository';

@Injectable()
export class TruyenService {
  constructor(private readonly truyenRepo: TruyenRepository) {}

  // 🔥 THÊM CRON JOB: Tự động reset lượt xem Ngày vào lúc 00:00 mỗi đêm
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleResetDailyViews() {
    console.log('🔄 [CronJob] Đang reset lượt xem ngày...');
    try {
      await this.truyenRepo.resetViews('luotXemNgay');
      console.log('✅ [CronJob] Reset lượt xem ngày thành công.');
    } catch (error) {
      console.error('❌ [CronJob] Lỗi khi reset lượt xem ngày:', error);
    }
  }

  // 🔥 THÊM CRON JOB: Tự động reset lượt xem Tuần vào lúc 00:00 ngày Chủ Nhật hàng tuần
  @Cron(CronExpression.EVERY_WEEKEND)
  async handleResetWeeklyViews() {
    console.log('🔄 [CronJob] Đang reset lượt xem tuần...');
    try {
      await this.truyenRepo.resetViews('luotXemTuan');
      console.log('✅ [CronJob] Reset lượt xem tuần thành công.');
    } catch (error) {
      console.error('❌ [CronJob] Lỗi khi reset lượt xem tuần:', error);
    }
  }

  // 🔥 THÊM CRON JOB: Tự động reset lượt xem Tháng vào lúc 00:00 ngày đầu tiên của mỗi tháng
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleResetMonthlyViews() {
    console.log('🔄 [CronJob] Đang reset lượt xem tháng...');
    try {
      await this.truyenRepo.resetViews('luotXemThang');
      console.log('✅ [CronJob] Reset lượt xem tháng thành công.');
    } catch (error) {
      console.error('❌ [CronJob] Lỗi khi reset lượt xem tháng:', error);
    }
  }

  async getLatestComics(page: number = 1, limit: number = 20, trangThai?: string) {
    const skip = (page - 1) * limit;
    const where: any = trangThai ? { trangThai } : {};

    const [data, total] = await Promise.all([
      this.truyenRepo.findLatestComics(skip, limit, where),
      this.truyenRepo.countComics(where),
    ]);

    return {
      data: data.map((t) => ({ ...t, chuongMoiNhat: t.chuongs?.[0]?.soChuong || 0 })),
      totalPages: Math.ceil(total / limit),
    };
  }

  async getXepHang(loai: string) {
    let orderByField: any = { luotXemThang: 'desc' };

    if (loai === 'ngay') orderByField = { luotXemNgay: 'desc' };
    else if (loai === 'tuan') orderByField = { luotXemTuan: 'desc' };
    else if (loai === 'thang') orderByField = { luotXemThang: 'desc' };

    const data = await this.truyenRepo.findComicsOrderBy(orderByField, 10);

    return data.map((t) => ({
      ...t,
      chuongMoiNhat: t.chuongs?.[0]?.soChuong || 0
    }));
  }

  async getTopViewed(limit: number = 10) {
    const data = await this.truyenRepo.findComicsOrderBy({ luotXem: 'desc' }, limit);
    return data.map((t) => ({ ...t, chuongMoiNhat: t.chuongs?.[0]?.soChuong || 0 }));
  }

  async deleteComic(id: number) {
    try {
      return await this.truyenRepo.delete(Number(id));
    } catch (error) {
      throw new BadRequestException("Không thể xóa truyện này.");
    }
  }

  async updateComic(id: number, data: any) {
    return await this.truyenRepo.update(Number(id), data);
  }

  async getComicById(id: number) {
    if (!id || isNaN(id)) throw new BadRequestException("ID không hợp lệ");

    const comic = await this.truyenRepo.findById(Number(id));
    if (!comic) throw new NotFoundException("Không tìm thấy truyện!");
    return comic;
  }

  async searchComics(query: string) {
    if (!query) return [];
    return this.truyenRepo.search(query);
  }

  async createComic(data: any) {
    return await this.truyenRepo.create(data);
  }

  async getAllComics() {
    return await this.truyenRepo.findLatestComics(0, 9999, {});
  }

  async incrementView(id: number) {
    const truyen = await this.truyenRepo.findByIdForViewIncrement(Number(id));
    if (!truyen) throw new NotFoundException("Không tìm thấy truyện!");

    return await this.truyenRepo.updateViews(Number(id), truyen.ngayCapNhat);
  }
}