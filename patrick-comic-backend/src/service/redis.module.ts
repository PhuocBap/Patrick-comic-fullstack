// src/service/redis.module.ts
import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';

@Global() // Đặt Global để các module khác không cần import lại nhiều lần
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}