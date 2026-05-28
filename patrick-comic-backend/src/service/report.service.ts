// src/service/report.service.ts
import { Injectable } from '@nestjs/common';
import { ReportRepository } from '../repositories/report.repository';

@Injectable()
export class ReportService {
  constructor(private readonly reportRepo: ReportRepository) {}

  async findAll() {
    return await this.reportRepo.findAll();
  }

  async createReport(data: { loaiLoi: string; moTa?: string; chuongId: any }) {
    return this.reportRepo.create({
      loaiLoi: data.loaiLoi,
      moTa: data.moTa,
      chuongId: Number(data.chuongId),
    });
  }

  async deleteReport(id: any) {
    // Xử lý linh hoạt ID String hoặc Number tùy theo schema.prisma của bạn
    const reportId = isNaN(Number(id)) ? String(id) : Number(id);
    return await this.reportRepo.delete(reportId);
  }
}