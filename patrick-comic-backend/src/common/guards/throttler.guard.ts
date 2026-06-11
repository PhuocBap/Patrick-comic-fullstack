// Trong file throttler-redis.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../service/redis.service';

@Injectable()
export class ThrottlerRedisGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector, // 👈 Thêm Reflector để đọc cấu hình custom
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress || 'unknown';
    const path = request.route.path;
    const method = request.method;
    const rateKey = `rate:${ip}:${method}:${path}`;

    // 💡 ĐỌC CẤU HÌNH CUSTOM TỪ ROUTE, NẾU KHÔNG CÓ THÌ DÙNG MẶC ĐỊNH
    const limit = this.reflector.get<number>('throttlerLimit', context.getHandler()) || 20;
    const windowSize = this.reflector.get<number>('throttlerWindow', context.getHandler()) || 60;

    try {
      const currentRequests = await this.redisService.incr(rateKey);
      if (currentRequests === null) return true;

      if (currentRequests === 1) {
        await this.redisService.expire(rateKey, windowSize);
      }

      if (currentRequests > limit) {
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
      if (error instanceof HttpException) throw error;
      console.error('⚠️ Lỗi Rate Limiting:', (error as Error).message);
    }
    return true;
  }
}