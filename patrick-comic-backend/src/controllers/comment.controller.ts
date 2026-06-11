// src/controllers/comment.controller.ts
import { Controller, Get, Post, Body, Query, ParseIntPipe, Delete, Param, UseGuards, UsePipes, ValidationPipe, BadRequestException } from '@nestjs/common';
import { CommentService } from '../service/comment.service';
import { RedisService } from '../service/redis.service';
import { ThrottlerRedisGuard } from '../common/guards/throttler.guard';
import { Throttle } from '../common/decorators/throttler.decorator';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import * as crypto from 'crypto'; // Thư viện có sẵn trong Node.js

@Controller('comments')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly redisService: RedisService,
  ) {}
  @Get('admin/all')
  async getCommentsForAdmin(
    @Query('chuongId') chuongId?: string,
    @Query('truyenId') truyenId?: string,
  ) {
    // Chuyển đổi query string sang dạng số (Number) nếu tồn tại để truyền vào database
    const parsedChuongId = chuongId ? Number(chuongId) : undefined;
    const parsedTruyenId = truyenId ? Number(truyenId) : undefined;

    const comments = await this.commentService.findAllForAdmin(parsedChuongId, parsedTruyenId);
    
    // Trả về đúng cấu trúc Object có bọc { success: true, data: ... } 
    // giúp đồng bộ 100% với hàm check xử lý lỗi `result.data` ở Frontend Admin của bạn!
    return {
      success: true,
      data: comments,
    };
  }

  @Get()
  async getComments(@Query('truyenId', ParseIntPipe) truyenId: number) {
    const cacheKey = `comments:truyen:${truyenId}`;
    try {
      const cachedComments = await this.redisService.get(cacheKey);
      if (cachedComments) return { success: true, data: JSON.parse(cachedComments) };
    } catch (err) { console.error(err); }

    const comments = await this.commentService.getCommentsByStory(Number(truyenId));
    try { await this.redisService.set(cacheKey, comments, 120); } catch (err) { console.error(err); }

    return { success: true, data: comments };
  }

  @Post()
  @UseGuards(ThrottlerRedisGuard)
  @Throttle(2, 15) // 🛡️ CHẶN SPAM: Tối đa 2 request bình luận trong vòng 15 giây
  @UsePipes(new ValidationPipe({ whitelist: true })) // 🔥 Kích hoạt tự động chặn độ dài dựa vào DTO
  async postComment(@Body() body: CreateCommentDto) {
    
    // 🛡️ NÂNG CAO: CHỐNG SPAM TRÙNG NỘI DUNG (User bấm gửi liên tục cùng 1 câu)
    const contentHash = crypto.createHash('md5').update(body.noiDung.trim().toLowerCase()).digest('hex');
    const duplicateCheckKey = `comment:repeat:${body.userId}:${contentHash}`;
    
    const isRepeated = await this.redisService.get(duplicateCheckKey);
    if (isRepeated) {
      throw new BadRequestException('Nội dung bình luận bị trùng lặp! Bạn vừa gửi nội dung này rồi.');
    }

    // Tiến hành lưu vào database
    const result = await this.commentService.createComment(
      body.userId, 
      Number(body.truyenId), 
      body.noiDung, 
      body.chuongId
    );

    // Lưu hash nội dung này lên Redis trong 30 giây để khóa không cho spam lại câu này
    await this.redisService.set(duplicateCheckKey, '1', 30);

    // Xóa cache danh sách bình luận cũ của truyện để cập nhật cái mới
    try {
      await this.redisService.del(`comments:truyen:${body.truyenId}`);
    } catch (err) { console.error(err); }

    return result;
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    return this.commentService.deleteComment(id);
  }
}