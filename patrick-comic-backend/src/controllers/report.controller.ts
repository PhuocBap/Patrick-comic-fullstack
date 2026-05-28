import { Controller, Post, Get, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ReportService } from '../service/report.service';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('admin/all')
  async getReports() {
    return this.reportService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async handleGuiBaoLoi(@Body() body: { loaiLoi: string; moTa?: string; chuongId: any }) {
    return this.reportService.createReport(body);
  }

  @Delete(':id')
  async deleteReport(@Param('id') id: string) {
    return this.reportService.deleteReport(id);
  }
}