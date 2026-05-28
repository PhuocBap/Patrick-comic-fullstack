// src/service/admin.service.ts
import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../repositories/admin.repository';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepo: AdminRepository) {}

  async getStats() {
    try {
      return await this.adminRepo.getSystemCounts();
    } catch (error) {
      console.error('Lỗi khi lấy thống kê tại AdminService:', error);
      // Trả về dữ liệu an toàn phòng khi lỗi kết nối DB hoặc lỗi runtime khác
      return { stories: 0, users: 0, reports: 0, comments: 0 };
    }
  }
}