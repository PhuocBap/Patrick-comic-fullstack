import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { TheLoaiService } from '../service/theloai.service';

@Controller('the-loai')
export class TheLoaiController {
  constructor(private readonly theLoaiService: TheLoaiService) {}

  // GIỮ NGUYÊN: API lấy danh sách
  @Get()
  async getCategories() {
    return this.theLoaiService.getAllTheLoai();
  }

  // GIỮ NGUYÊN: API lấy chi tiết
  @Get(':id')
  async getCategoryDetail(@Param('id') id: string) { // Nhận string trực tiếp
    return this.theLoaiService.getTheLoaiById(id);
  }

  // THÊM MỚI: API POST nhận yêu cầu thêm thể loại từ Frontend
  @Post()
  async createCategory(@Body('ten') ten: string) {
    return this.theLoaiService.createTheLoai(ten);
  }

  // THÊM MỚI: API DELETE nhận yêu cầu xóa thể loại từ Frontend
  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    return this.theLoaiService.deleteTheLoai(id);
  }
}