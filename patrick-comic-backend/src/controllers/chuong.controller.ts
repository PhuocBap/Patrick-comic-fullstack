import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, BadRequestException, UseGuards } from '@nestjs/common';
import { ChuongService } from '../service/chuong.service';
import { CrawlService } from '../service/crawl.service';
import { ThrottlerRedisGuard } from '../common/guards/throttler.guard';

@Controller('chuong')
@UseGuards(ThrottlerRedisGuard)
export class ChuongController {
  constructor(
    private readonly chuongService: ChuongService,
    private readonly crawlService: CrawlService,
  ) {}

  // ==========================================
  // 1. CÁC ROUTE TĨNH (STATIC ROUTES) - ĐƯA LÊN TRÊN CÙNG
  // ==========================================

  @Get('find')
  async findChapter(@Query('slug') slug: string, @Query('soChuong') soChuong: string) {
    if (!slug || !soChuong) {
      throw new BadRequestException('Thiếu tham số slug hoặc soChuong');
    }
    return this.chuongService.findChapterBySlugAndNumber(slug, parseFloat(soChuong));
  }

  @Post('crawl-bulk-stories')
  async crawlBulkStories(@Body() body: { urlPage: string }) {
    if (!body.urlPage) {
      throw new BadRequestException('Thiếu tham số urlPage chứa danh sách truyện!');
    }
    return this.crawlService.crawlMultiStoriesFromPage(body.urlPage);
  }

  @Post('crawl-all')
  async crawlAllChapters(@Body() body: { url: string; truyenId: number }) { // Đã sửa thành url: string
    if (!body.url || !body.truyenId) {
      throw new BadRequestException('Thiếu tham số url truyện hoặc truyenId');
    }
    return this.crawlService.crawlAllChaptersFromStory(body.url, body.truyenId);
  }

  @Post('crawl')
  async crawlChapter(@Body() body: { url: string; truyenId: number; soChuong: number; tenChuong?: string }) {
    if (!body.url || !body.truyenId || !body.soChuong) {
      throw new BadRequestException('Thiếu tham số url, truyenId hoặc soChuong để cào');
    }
    return this.crawlService.crawlSingleChapterFromBlogTruyen(body.url, body.truyenId, body.soChuong, body.tenChuong);
  }

  @Post('auto-crawl')
  async autoCrawl(@Body() body: { slug: string; truyenId: number; soChuong: number }) {
    if (!body.slug || !body.truyenId || !body.soChuong) {
      throw new BadRequestException('Thiếu thông tin để tự động cào');
    }
    return this.crawlService.crawlSingleChapterFromBlogTruyen(
      `https://blogtruyenmoi.net/${body.slug}/chuong-${body.soChuong}`,
      body.truyenId,
      body.soChuong
    );
  }

  @Post()
  async create(@Body() body: any) {
    return this.chuongService.createChuong(body);
  }

  // ==========================================
  // 2. CÁC ROUTE ĐỘNG (DYNAMIC ROUTES) - ĐƯA XUỐNG DƯỚI CÙNG
  // ==========================================

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.chuongService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.chuongService.updateChapter(id, body);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.chuongService.deleteChapter(id);
  }
}