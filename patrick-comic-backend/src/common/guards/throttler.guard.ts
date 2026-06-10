import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RedisService } from '../../service/redis.service'; // Chỉnh lại đường dẫn file redis của bạn

@Injectable()
export class ThrottlerRedisGuard implements CanActivate {
  // Định nghĩa cấu hình mặc định: Tối đa 20 request trong vòng 60 giây
  private readonly LIMIT = 20; 
  private readonly WINDOW_SIZE_IN_SECONDS = 60;

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Lấy IP của người dùng (hỗ trợ cả khi chạy qua Proxy/Render)
    const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress || 'unknown';
    
    // Lấy thông tin router đang gọi để phân biệt chặn spam từng API riêng biệt
    const path = request.route.path;
    const method = request.method;

    // Tạo key định danh riêng cho IP đó tại API đó
    const rateKey = `rate:${ip}:${method}:${path}`;

    try {
      // 1. Tăng bộ đếm trên RAM Redis lên 1
      const currentRequests = await this.redisService.incr(rateKey);

      if (currentRequests === null) return true; // Nếu Redis sập, bỏ qua cho user đi tiếp

      // 2. Nếu đây là request đầu tiên, đặt thời gian sống (TTL) cho cửa sổ này là 60 giây
      if (currentRequests === 1) {
        await this.redisService.set(rateKey, 1, this.WINDOW_SIZE_IN_SECONDS);
      }

      // 3. Nếu số lượng request vượt ngưỡng giới hạn -> Chặn đứng!
      if (currentRequests > this.LIMIT) {
        const timeLeft = await this.redisService.ttl(rateKey);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Bạn đang thao tác quá nhanh! Vui lòng thử lại sau ${timeLeft > 0 ? timeLeft : 0} giây.`,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (error) {
      // Nếu là lỗi Too Many Requests ta ném ra cho user, còn lỗi Redis sập thì cho đi tiếp để bảo toàn ứng dụng
      if (error instanceof HttpException) throw error;
      console.error('⚠️ Lỗi hệ thống Rate Limiting:', (error as Error).message);
    }

    return true;
  }
}