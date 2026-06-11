import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TruyenRepository } from '../repositories/truyen.repository';
import { RedisService } from './redis.service'; 

@Injectable()
export class TruyenService {
  constructor(
    private readonly truyenRepo: TruyenRepository,
    private readonly redisService: RedisService,
  ) {}

  // 💡 KHUÔN PAYLOAD THU GỌN: Tuyệt đối KHÔNG chứa cột 'moTa' nặng nề khi lấy danh sách
  private readonly comicListSelect = {
    id: true,
    tenTruyen: true,
    slug: true,
    thumbnail: true,
    trangThai: true,
    luotXem: true,
    tacGia: true,
    ngayCapNhat: true,
    chuongs: {
      take: 1,
      orderBy: { soChuong: 'desc' as const },
      select: { id: true, tenChuong: true, soChuong: true }
    }
  };

  // ==========================================
  // CRON JOBS - ĐỒNG BỘ VIEW & DỌN DẸP CACHE
  // ==========================================

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleSyncViewsFromRedis() {
    console.log('🔄 [CronJob] Đang tiến hành đồng bộ lượt xem từ Redis xuống DB...');
    try {
      // Sử dụng SCAN (an toàn) thay thế hoàn toàn cho KEYS (gây treo app)
      const keys = await this.redisService.scan('truyen:*:views');
      if (keys.length === 0) return;

      for (const key of keys) {
        const truyenId = Number(key.split(':')[1]);
        const viewsCountStr = await this.redisService.get(key);
        const viewsCount = viewsCountStr ? parseInt(viewsCountStr, 10) : 0;

        if (viewsCount > 0) {
          const truyen = await this.truyenRepo.findByIdForViewIncrement(truyenId);
          if (truyen) {
            await this.truyenRepo.updateMultipleViews(truyenId, viewsCount, truyen.ngayCapNhat);
            await this.redisService.del(key); 
          }
        }
      }
      console.log('✅ [CronJob] Đồng bộ lượt xem từ Redis thành công.');
      await this.clearLatestComicsCache();
    } catch (error) {
      console.error('❌ [CronJob] Lỗi khi đồng bộ lượt xem từ Redis:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleResetDailyViews() {
    console.log('🔄 [CronJob] Đang reset lượt xem ngày...');
    try {
      // Đồng bộ nốt lượng view tích lũy cuối ngày trước khi dọn dẹp bxh
      await this.handleSyncViewsFromRedis();
      await this.truyenRepo.resetViews('luotXemNgay');
      await this.redisService.del('bxh:ngay'); 
      console.log('✅ [CronJob] Reset lượt xem ngày thành công.');
    } catch (error) {
      console.error('❌ [CronJob] Lỗi khi reset lượt xem ngày:', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEKEND)
  async handleResetWeeklyViews() {
    console.log('🔄 [CronJob] Đang reset lượt xem tuần...');
    try {
      await this.handleSyncViewsFromRedis();
      await this.truyenRepo.resetViews('luotXemTuan');
      await this.redisService.del('bxh:tuan'); 
      console.log('✅ [CronJob] Reset lượt xem tuần thành công.');
    } catch (error) {
      console.error('❌ [CronJob] Lỗi khi reset lượt xem tuần:', error);
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleResetMonthlyViews() {
    console.log('🔄 [CronJob] Đang reset lượt xem tháng...');
    try {
      await this.handleSyncViewsFromRedis();
      await this.truyenRepo.resetViews('luotXemThang');
      await this.redisService.del('bxh:thang'); 
      console.log('✅ [CronJob] Reset lượt xem tháng thành công.');
    } catch (error) {
      console.error('❌ [CronJob] Lỗi khi reset lượt xem tháng:', error);
    }
  }

  // ==========================================
  // CORE BUSINESS LOGIC (APIs)
  // ==========================================

  async getLatestComics(page: number = 1, limit: number = 20, trangThai?: string) {
    const cacheKey = `truyen:latest:page:${page}:limit:${limit}:status:${trangThai || 'all'}`;

    try {
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) return JSON.parse(cachedData); 
    } catch (error) {
      console.error('⚠️ Lỗi khi đọc cache từ Redis (Chuyển hướng sang quét DB):', (error as Error).message);
    }

    const skip = (page - 1) * limit;
    const where: any = trangThai ? { trangThai } : {};

    // 🔥 TỐI ƯU: Đẩy thẳng cấu trúc select field thu gọn xuống DB thông qua Repository
    const [data, total] = await Promise.all([
      this.truyenRepo.findLatestComics(skip, limit, where, ),
      this.truyenRepo.countComics(where),
    ]);

    const result = {
      data: data.map((t: any) => ({
        id: t.id,
        tenTruyen: t.tenTruyen,
        slug: t.slug,
        thumbnail: t.thumbnail,
        trangThai: t.trangThai,
        luotXem: t.luotXem,
        tacGia: t.tacGia,
        ngayCapNhat: t.ngayCapNhat,
        chuongMoiNhat: t.chuongs?.[0]?.soChuong || 0
      })),
      totalPages: Math.ceil(total / limit),
    };

    try {
      await this.redisService.set(cacheKey, result, 300); // Lưu cache 5 phút
    } catch (error) {
      console.error('⚠️ Lỗi khi lưu cache vào Redis:', (error as Error).message);
    }

    return result;
  }

  async getXepHang(loai: string) {
    let bxhKey = 'bxh:thang';
    if (loai === 'ngay') bxhKey = 'bxh:ngay';
    else if (loai === 'tuan') bxhKey = 'bxh:tuan';

    try {
      const topIdsStr = await this.redisService.zrevrange(bxhKey, 0, 9);
      
      if (topIdsStr.length > 0) {
        const topIds = topIdsStr.map(id => Number(id));
        // 🔥 TỐI ƯU: Lọc theo danh sách ID và áp dụng select trường gọn nhẹ
        const dbData = await this.truyenRepo.findLatestComics(0, 10, { id: { in: topIds } }, );
        
        const sortedData = topIds
          .map(id => dbData.find((t: any) => t.id === id))
          .filter((t): t is NonNullable<typeof t> => !!t);

        return sortedData.map((t: any) => ({
          id: t.id,
          tenTruyen: t.tenTruyen,
          slug: t.slug,
          thumbnail: t.thumbnail,
          trangThai: t.trangThai,
          luotXem: t.luotXem,
          tacGia: t.tacGia,
          ngayCapNhat: t.ngayCapNhat,
          chuongMoiNhat: t.chuongs?.[0]?.soChuong || 0
        }));
      }
    } catch (error) {
      console.error('⚠️ Lỗi khi lấy BXH từ Redis, chuyển hướng quét DB:', (error as Error).message);
    }

    let orderByField: any = { luotXemThang: 'desc' };
    if (loai === 'ngay') orderByField = { luotXemNgay: 'desc' };
    else if (loai === 'tuan') orderByField = { luotXemTuan: 'desc' };

    // 🔥 TỐI ƯU: Ép DB trả về payload gọn nhẹ dựa trên select cấu hình sẵn
    const data = await this.truyenRepo.findComicsOrderBy(orderByField, 10, );

    return data.map((t: any) => ({
      id: t.id,
      tenTruyen: t.tenTruyen,
      slug: t.slug,
      thumbnail: t.thumbnail,
      trangThai: t.trangThai,
      luotXem: t.luotXem,
      ngayCapNhat: t.ngayCapNhat,
      chuongMoiNhat: t.chuongs?.[0]?.soChuong || 0
    }));
  }

  async getTopViewed(limit: number = 10) {
    // 🔥 TỐI ƯU: Truyền select field tối giản dữ liệu trả về của top viewed
    const data = await this.truyenRepo.findComicsOrderBy({ luotXem: 'desc' }, limit, );
    return data.map((t: any) => ({
      id: t.id,
      tenTruyen: t.tenTruyen,
      slug: t.slug,
      thumbnail: t.thumbnail,
      trangThai: t.trangThai,
      luotXem: t.luotXem,
      tacGia: t.tacGia,
      ngayCapNhat: t.ngayCapNhat,
      chuongMoiNhat: t.chuongs?.[0]?.soChuong || 0
    }));
  }

  async searchComics(query: string) {
    if (!query) return [];
    const data = await this.truyenRepo.search(query);
    return data.map((t: any) => ({
      id: t.id,
      tenTruyen: t.tenTruyen,
      slug: t.slug,
      thumbnail: t.thumbnail,
      trangThai: t.trangThai
    }));
  }

  async incrementView(id: number) {
    // 🔥 TỐI ƯU: Đọc thông tin kiểm tra nhẹ trước khi xử lý bộ đếm RAM
    const truyen = await this.truyenRepo.findByIdForViewIncrement(Number(id));
    if (!truyen) throw new NotFoundException("Không tìm thấy truyện!");

    const redisKey = `truyen:${id}:views`;
    const result = await this.redisService.incr(redisKey);

    if (result !== null) {
      const memberId = String(id);
      await this.redisService.zincrby('bxh:ngay', 1, memberId);
      await this.redisService.zincrby('bxh:tuan', 1, memberId);
      await this.redisService.zincrby('bxh:thang', 1, memberId);

      return { success: true, message: 'Ghi nhận lượt xem vào hàng đợi RAM thành công.' };
    }

    // Fallback nếu Redis có vấn đề trục trặc
    return await this.truyenRepo.updateViews(Number(id), truyen.ngayCapNhat);
  }

  // ==========================================
  // MANAGEMENT LOGIC (CRUD)
  // ==========================================

  async getComicById(id: number) {
    if (!id || isNaN(id)) throw new BadRequestException("ID không hợp lệ");

    const comic = await this.truyenRepo.findById(Number(id));
    if (!comic) throw new NotFoundException("Không tìm thấy truyện!");
    return comic;
  }

  async createComic(data: any) {
    const result = await this.truyenRepo.create(data);
    await this.clearLatestComicsCache(); 
    return result;
  }

  async updateComic(id: number, data: any) {
    const result = await this.truyenRepo.update(Number(id), data);
    await this.clearLatestComicsCache(); 
    return result;
  }

  async deleteComic(id: number) {
    try {
      const result = await this.truyenRepo.delete(Number(id));
      await this.clearLatestComicsCache(); 
      return result;
    } catch (error) {
      throw new BadRequestException("Không thể xóa truyện này.");
    }
  }

  async getAllComics() {
    return await this.truyenRepo.findLatestComics(0, 9999, {}, );
  }

  // ==========================================
  // PRIVATE UTILS
  // ==========================================

  private async clearLatestComicsCache() {
    try {
      // 🔥 TỐI ƯU THỰC SỰ: Quét key bằng SCAN, sửa triệt để lỗi ép kiểu của `error: unknown`
      const keys = await this.redisService.scan('truyen:latest:*');
      for (const key of keys) {
        await this.redisService.del(key);
      }
    } catch (error) {
      console.error('⚠️ Không thể dọn dẹp khóa cache cũ:', (error as Error).message);
    }
  }
}