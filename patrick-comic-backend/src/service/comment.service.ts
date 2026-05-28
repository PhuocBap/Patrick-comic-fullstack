// src/service/comment.service.ts
import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { CommentRepository } from '../repositories/comment.repository';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepo: CommentRepository) {}

  // Lấy bình luận cho người dùng xem ở trang chi tiết truyện
  async getCommentsByStory(truyenId: number) {
    try {
      return await this.commentRepo.findByStory(Number(truyenId));
    } catch (error) {
      console.error("Lỗi lấy bình luận:", error);
      return [];
    }
  }

  // Lấy tất cả cho Admin (Hỗ trợ lọc theo chuongId hoặc truyenId nếu có)
  async findAllForAdmin(chuongId?: number, truyenId?: number) {
    const whereCondition: any = {};
    if (chuongId) whereCondition.chuongId = chuongId;
    if (truyenId) whereCondition.truyenId = truyenId;

    return await this.commentRepo.findAllForAdmin(whereCondition);
  }

  async createComment(userId: string, truyenId: number, noiDung: string, chuongId?: number) {
    if (!userId) throw new BadRequestException("Thiếu mã người dùng");
    try {
      return await this.commentRepo.create({
        noiDung: noiDung.trim(),
        truyenId: Number(truyenId),
        chuongId: chuongId ? Number(chuongId) : null,
        nguoiDungId: String(userId)
      });
    } catch (error) {
      throw new InternalServerErrorException("Lỗi hệ thống khi lưu bình luận");
    }
  }

  async deleteComment(id: string) {
    try {
      return await this.commentRepo.delete(String(id));
    } catch (error) {
      throw new NotFoundException("Bình luận không tồn tại");
    }
  }
}