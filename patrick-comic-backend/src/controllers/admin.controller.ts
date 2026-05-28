import { Controller, Get } from '@nestjs/common';
import { AdminService } from '../service/admin.service';

@Controller('admin') // Đường dẫn: http://localhost:3001/admin
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats') // Đường dẫn: http://localhost:3001/admin/stats
  async getStats() {
    return this.adminService.getStats();
  }
}