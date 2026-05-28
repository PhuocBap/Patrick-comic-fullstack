// src/service/follow.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FollowRepository } from '../repositories/follow.repository';

@Injectable()
export class FollowService {
  constructor(private readonly followRepo: FollowRepository) {}

  async toggleFollow(userId: string, truyenId: number) {
    try {
      const numericTruyenId = Number(truyenId);
      
      // Kiểm tra trạng thái thông qua Repo
      const existingFollow = await this.followRepo.findUniqueFollow(userId, numericTruyenId);

      if (existingFollow) {
        await this.followRepo.delete(existingFollow.id);
        return { followed: false, message: "Đã bỏ theo dõi" };
      } else {
        await this.followRepo.create(userId, numericTruyenId);
        return { followed: true, message: "Theo dõi thành công" };
      }
    } catch (error: any) {
      console.error("Lỗi Follow Service:", error.message);
      throw new InternalServerErrorException("Lỗi hệ thống khi xử lý theo dõi");
    }
  }

  async checkFollowStatus(userId: string, truyenId: number) {
    try {
      const follow = await this.followRepo.findUniqueFollow(userId, Number(truyenId));
      return { followed: !!follow };
    } catch (error) {
      return { followed: false };
    }
  }

  // Lấy danh sách truyện đã theo dõi hiển thị lên Client
  async getFollowsByUser(userId: string) {
    try {
      return await this.followRepo.findManyByUser(userId);
    } catch (error) {
      console.error("Lỗi lấy danh sách follow:", error);
      return [];
    }
  }
}