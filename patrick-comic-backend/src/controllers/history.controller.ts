import { Controller, Get, Post, Body, Query, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { HistoryService } from '../service/history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  async getHistory(@Query('email') email: string) {
    if (!email) throw new UnauthorizedException("Thiếu email người dùng");

    const user = await this.historyService.findUserByEmail(email);
    if (!user) throw new NotFoundException("Người dùng không tồn tại");

    return this.historyService.getHistoryByUserId(user.id);
  }

  @Post('update')
  async updateHistory(@Body() data: { userId?: string; email?: string; truyenId: number; chuongId: number }) {
    let user;

    // Ưu tiên tìm bằng userId nếu Frontend gửi lên
    if (data.userId) {
      user = await this.historyService.findUserById(data.userId);
    } else if (data.email) {
      user = await this.historyService.findUserByEmail(data.email);
    }

    if (!user) throw new BadRequestException("Người dùng không hợp lệ hoặc thiếu thông tin định danh");

    return this.historyService.updateReadingHistory(
      user.id,
      Number(data.truyenId),
      Number(data.chuongId)
    );
  }
}