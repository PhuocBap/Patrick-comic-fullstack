// src/service/history.service.ts
import { Injectable } from '@nestjs/common';
import { HistoryRepository } from '../repositories/history.repository';

@Injectable()
export class HistoryService {
  constructor(private readonly historyRepo: HistoryRepository) {}

  // Kiểm tra email hợp lệ trước khi tìm kiếm để tránh lỗi Prisma
  async findUserByEmail(email: string) {
    if (!email) return null; // Tránh PrismaClientValidationError
    return this.historyRepo.findUserByEmail(email);
  }

  // Tìm người dùng trực tiếp bằng ID (Nhanh và chính xác hơn)
  async findUserById(id: string) {
    if (!id) return null;
    return this.historyRepo.findUserById(id);
  }

  async updateReadingHistory(userId: string, truyenId: number, chuongId: number) {
    // Gọi qua repo xử lý cấu trúc upsert
    return await this.historyRepo.upsertHistory(userId, truyenId, chuongId);
  }

  async getHistoryByUserId(userId: string) {
    return await this.historyRepo.findHistoryByUserId(userId);
  }
}