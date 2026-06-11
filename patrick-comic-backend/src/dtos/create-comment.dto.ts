// Tạo file src/dtos/create-comment.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, Length } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã người dùng không được để trống' })
  userId!: string;

  @IsNumber({}, { message: 'Mã truyện phải là số hợp lệ' })
  @IsNotEmpty()
  truyenId!: number;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung bình luận không được bỏ trống' })
  // 🎯 GIỚI HẠN: Tối thiểu 3 ký tự, tối đa 500 ký tự để tránh làm phình DB
  @Length(3, 500, { message: 'Bình luận phải có độ dài từ 3 đến 250 ký tự.' })
  noiDung!: string;

  @IsNumber()
  @IsOptional()
  chuongId?: number;
}