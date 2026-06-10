import { Controller, Get, Post, Patch, Delete, Body, Query, Param, BadRequestException, UseGuards } from '@nestjs/common'; // 🔥 CẬP NHẬT: Thêm UseGuards
import { TruyenService } from '../service/truyen.service';

// 🔥 THÊM MỚI: Import ThrottlerRedisGuard để hết lỗi đỏ lạc lõng
import { ThrottlerRedisGuard } from '../common/guards/throttler.guard';

@Controller('stories')
export class TruyenController {
  constructor(private readonly truyenService: TruyenService) {}

  @Get()
  async getLatest(@Query('page') page: string, @Query('limit') limit: string, @Query('trangThai') trangThai?: string) {
    return this.truyenService.getLatestComics(Number(page) || 1, Number(limit) || 12, trangThai);
  }

  @Get('search')
  @UseGuards(ThrottlerRedisGuard) // 🔥 Đã được bọc "khiên" chống spam bằng Redis an toàn
  async search(@Query('query') query: string) {
    return this.truyenService.searchComics(query);
  }

  @Get('xep-hang')
  async getXepHang(@Query('type') type: string) {
    return this.truyenService.getXepHang(type || 'thang'); 
  }

  @Get('top-viewed')
  async getTopViewed(@Query('limit') limit: string) {
    return this.truyenService.getTopViewed(Number(limit) || 10);
  }

  @Patch(':id/view')
  async incrementView(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException("ID phải là số hợp lệ");
    }
    return this.truyenService.incrementView(numericId);
  }

  @Get(':id')
  async getDetail(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException("ID phải là số hợp lệ");
    }
    return this.truyenService.getComicById(numericId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException("ID phải là số hợp lệ");
    }
    return this.truyenService.deleteComic(numericId);
  }
  
  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException("ID phải là số hợp lệ");
    }
    return this.truyenService.updateComic(numericId, data);
  }

  @Post()
  async create(@Body() data: any) {
    return this.truyenService.createComic(data);
  }
}