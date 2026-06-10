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

  // 💡 ĐỊNH NGHĨA KHUÔN PAYLOAD TRANG CHỦ / LIST (Tuyệt đối KHÔNG chứa cột 'moTa')
  private readonly comicListSelect = {
    id: true,
    tenTruyen: true,
    slug: true,
    thumbnail: true,
    trangThai: true,
    luotXem: true,
    ngayCapNhat: true,
    chuongs: {
      take: 1,
      orderBy: { soChuong: 'desc' },
      select: {
        id: true,
        tenChuong: true,
        soChuong: true,
      }
    }
  };

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleResetDailyViews() {
    console.log('🔄 [CronJob] Đang reset lượt xem ngày...');
    try {
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
      await this.truyenRepo.resetViews('luotXemThang');
      await this.redisService.del('bxh:thang'); 
      console.log('✅ [CronJob] Reset lượt xem tháng thành công.');
    } catch (error) {
      console.error('❌ [CronJob] Lỗi khi reset lượt xem tháng:', error);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleSyncViewsFromRedis() {
    console.log('🔄 [CronJob] Đang tiến hành đồng bộ lượt xem từ Redis xuống DB...');
    try {
      const keys = await this.redisService.keys('truyen:*:views');
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

  // 🔥 CẬP NHẬT: Tối ưu Payload Trang chủ thông qua việc chọc lọc select
  async getLatestComics(page: number = 1, limit: number = 20, trangThai?: string) {
    const cacheKey = `truyen:latest:page:${page}:limit:${limit}:status:${trangThai || 'all'}`;

    try {
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData); 
      }
    } catch (error) {
      console.error('⚠️ Lỗi khi đọc cache từ Redis (Chuyển hướng sang quét DB):', (error as Error).message);
    }

    const skip = (page - 1) * limit;
    const where: any = trangThai ? { trangThai } : {};

    // Gửi kèm khuôn dữ liệu thu gọn 'comicListSelect' xuống Repo nếu Repo của bạn hỗ trợ nhận select fields,
    // hoặc map/filter payload sau khi lấy từ DB lên để bóc tách text thừa.
    const [data, total] = await Promise.all([
      this.truyenRepo.findLatestComics(skip, limit, where, ), // Cập nhật tham số truyền select lọc
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
        ngayCapNhat: t.ngayCapNhat,
        chuongMoiNhat: t.chuongs?.[0]?.soChuong || 0
      })),
      totalPages: Math.ceil(total / limit),
    };

    try {
      await this.redisService.set(cacheKey, result, 300);
    } catch (error) {
      console.error('⚠️ Lỗi khi lưu cache vào Redis:', (error as Error).message);
    }

    return result;
  }

  // 🔥 CẬP NHẬT: Tối ưu Payload Bảng Xếp Hạng
  async getXepHang(loai: string) {
    let bxhKey = 'bxh:thang';
    if (loai === 'ngay') bxhKey = 'bxh:ngay';
    else if (loai === 'tuan') bxhKey = 'bxh:tuan';

    try {
      const topIdsStr = await this.redisService.zrevrange(bxhKey, 0, 9);
      
      if (topIdsStr.length > 0) {
        const topIds = topIdsStr.map(id => Number(id));
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

    const data = await this.truyenRepo.findComicsOrderBy(orderByField, 10,);

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

  // 🔥 CẬP NHẬT: Tối ưu Payload Top Viewed
  async getTopViewed(limit: number = 10) {
    const data = await this.truyenRepo.findComicsOrderBy({ luotXem: 'desc' }, limit, );
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

  // 🔥 CẬP NHẬT: Tối ưu Payload Tìm kiếm (Chỉ trả về các trường cần cho ô gợi ý kết quả)
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

  async deleteComic(id: number) {
    try {
      const result = await this.truyenRepo.delete(Number(id));
      await this.clearLatestComicsCache(); 
      return result;
    } catch (error) {
      throw new BadRequestException("Không thể xóa truyện này.");
    }
  }

  async updateComic(id: number, data: any) {
    const result = await this.truyenRepo.update(Number(id), data);
    await this.clearLatestComicsCache(); 
    return result;
  }

  // 💡 LƯU Ý: Riêng hàm xem CHI TIẾT truyện thì GIỮ NGUYÊN để lấy toàn bộ trường (bao gồm cả cột 'moTa') cho trang Detail
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

  async getAllComics() {
    return await this.truyenRepo.findLatestComics(0, 9999, {});
  }

  async incrementView(id: number) {
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

    return await this.truyenRepo.updateViews(Number(id), truyen.ngayCapNhat);
  }

  private async clearLatestComicsCache() {
    try {
      const keys = await this.redisService.keys('truyen:latest:*');
      for (const key of keys) {
        await this.redisService.del(key);
      }
    } catch (error) {
      console.error('⚠️ Không thể dọn dẹp khóa cache cũ:', (error as Error).message);
    }
  }
}