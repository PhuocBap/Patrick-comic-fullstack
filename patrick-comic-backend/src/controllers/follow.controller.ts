import { Controller, Post, Body, Get, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { FollowService } from '../service/follow.service';

@Controller('follow') // Dùng 'follow' thống nhất với Frontend
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  // Lấy danh sách truyện đã theo dõi: GET /follow?userId=...
  @Get()
  async getFollows(@Query('userId') userId: string) {
    if (!userId || userId === 'undefined') return [];
    return this.followService.getFollowsByUser(userId);
  }

  // Kiểm tra trạng thái nút bấm: GET /follow/status?userId=...&truyenId=...
  @Get('status')
  async getStatus(
    @Query('userId') userId: string,
    @Query('truyenId', ParseIntPipe) truyenId: number,
  ) {
    if (!userId || userId === 'undefined') return { followed: false };
    return this.followService.checkFollowStatus(userId, truyenId);
  }

  // Bấm nút Theo dõi: POST /follow
  @Post()
  async toggle(@Body() body: { userId: string; truyenId: number }) {
    if (!body.userId) throw new BadRequestException("Vui lòng đăng nhập");
    return this.followService.toggleFollow(body.userId, body.truyenId);
  }
}