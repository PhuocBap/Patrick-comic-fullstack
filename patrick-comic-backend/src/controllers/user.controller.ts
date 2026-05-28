import { Controller, Get, Post, Patch, Param, Body, Delete } from '@nestjs/common';
import { UserService } from '../service/user.service';

@Controller('users') // Endpoint duy nhất: /users
export class UserController {
  constructor(private readonly userService: UserService) {}

  // POST: /users/register (Dùng cho đăng ký)
  @Post('register')
  async register(@Body() body: any) {
    return this.userService.register(body);
  }

  // GET: /users (Lấy danh sách cho trang Admin)
  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  // PATCH: /users/:id/role (Cập nhật quyền)
  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body() data: { role: string }) {
    return this.userService.updateRole(id, data.role);
  }

  // PATCH: /users/:id/block (Khóa / Mở khóa user)
  @Patch(':id/block')
  async toggleBlock(@Param('id') id: string, @Body() data: { isBlocked: boolean }) {
    return this.userService.toggleBlock(id, data.isBlocked);
  }

  // DELETE: /users/:id (Xóa user vĩnh viễn)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}