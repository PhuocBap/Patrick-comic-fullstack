// src/controllers/comment.controller.ts
import { Controller, Get, Post, Body, Query, ParseIntPipe, Delete, Param } from '@nestjs/common';
import { CommentService } from '../service/comment.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('admin/all')
  async getAllForAdmin(
    @Query('chuongId') chuongId?: string,
    @Query('truyenId') truyenId?: string
  ) {
    const filterChuongId = chuongId ? Number(chuongId) : undefined;
    const filterTruyenId = truyenId ? Number(truyenId) : undefined;
    
    // FIX: Đã truyền chính xác filterChuongId và filterTruyenId vào service
    return this.commentService.findAllForAdmin(filterChuongId, filterTruyenId);
  }

  @Get()
  async getComments(@Query('truyenId', ParseIntPipe) truyenId: number) {
    const comments = await this.commentService.getCommentsByStory(Number(truyenId));
    return { success: true, data: comments };
  }

  @Post()
  async postComment(@Body() body: { userId: string; truyenId: number; noiDung: string; chuongId?: number }) {
    return this.commentService.createComment(
      body.userId, 
      Number(body.truyenId), 
      body.noiDung, 
      body.chuongId ? Number(body.chuongId) : undefined
    );
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    return this.commentService.deleteComment(id);
  }
}