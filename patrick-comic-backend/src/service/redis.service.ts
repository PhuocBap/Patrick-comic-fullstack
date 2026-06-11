import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import RedisClient from 'ioredis'; // Import class mặc định để dùng làm giá trị khởi tạo (new)
import type { Redis } from 'ioredis'; // Import riêng kiểu dữ liệu cho TypeScript

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  // Thêm dấu "!" để báo cho TypeScript biết thuộc tính này chắc chắn sẽ được gán giá trị trong onModuleInit
  private redisClient!: Redis; 
  private isConnected = false;

  onModuleInit() {
    // Đọc URL từ file .env, nếu không có sẽ tự động fallback về localhost
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    console.log('⏳ Đang khởi tạo kết nối tới Redis...');

    // Sử dụng RedisClient đã import ở trên để khởi tạo thực thể đối tượng
    this.redisClient = new RedisClient(redisUrl, {
      maxRetriesPerRequest: 1, // Không thử lại vô hạn để tránh treo app nếu Redis sập
      retryStrategy(times) {
        // Cố gắng kết nối lại sau mỗi 5 giây nếu mất kết nối
        return Math.min(times * 50, 5000);
      },
    });

    // Bắt sự kiện kết nối thành công
    this.redisClient.on('connect', () => {
      this.isConnected = true;
      console.log('✅ Kết nối thành công tới Redis Server!');
    });

    // Bắt lỗi nếu không bật Redis Local để KHÔNG BỊ SẬP APP
    this.redisClient.on('error', (error) => {
      this.isConnected = false;
      console.error('❌ Lỗi Redis:', error.message);
      console.log('⚠️ Ứng dụng vẫn chạy, các tính năng liên quan đến Redis tạm thời bị bỏ qua.');
    });
  }

  // Đóng kết nối khi tắt server NestJS
  onModuleDestroy() {
    if (this.redisClient) {
      this.redisClient.disconnect();
    }
  }

  // Các hàm tương tác với Redis
  async get(key: string): Promise<string | null> {
    if (!this.isConnected) return null;
    try {
      return await this.redisClient.get(key);
    } catch (err) {
      return null;
    }
  }

  async set(key: string, value: any, ttlInSeconds?: number): Promise<void> {
    if (!this.isConnected) return; 
    try {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (ttlInSeconds) {
        await this.redisClient.set(key, stringValue, 'EX', ttlInSeconds);
      } else {
        await this.redisClient.set(key, stringValue);
      }
    } catch (err) {
      console.error('Lỗi khi ghi dữ liệu vào Redis:', err);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.redisClient.del(key);
    } catch (err) {
      console.error('Lỗi khi xóa dữ liệu trong Redis:', err);
    }
  }

  // 🔥 THÊM MỚI: Tăng giá trị key lên 1 đơn vị
  async incr(key: string): Promise<number | null> {
    if (!this.isConnected) return null;
    try {
      return await this.redisClient.incr(key);
    } catch (err) {
      console.error('Lỗi khi INCR Redis:', err);
      return null;
    }
  }

  // 🔥 THÊM MỚI: Tìm kiếm danh sách các key theo pattern
  async keys(pattern: string): Promise<string[]> {
    if (!this.isConnected) return [];
    try {
      return await this.redisClient.keys(pattern);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách KEYS Redis:', err);
      return [];
    }
  }

  // 🔥 THÊM MỚI: Tăng điểm số (số view) của một phần tử trong Sorted Set
  async zincrby(key: string, increment: number, member: string): Promise<string | null> {
    if (!this.isConnected) return null;
    try {
      return await this.redisClient.zincrby(key, increment, member);
    } catch (err) {
      console.error('Lỗi khi ZINCRBY Redis:', err);
      return null;
    }
  }

  // 🔥 THÊM MỚI: Lấy danh sách phần tử có điểm số từ cao đến thấp trong khoảng start -> stop
  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    if (!this.isConnected) return [];
    try {
      return await this.redisClient.zrevrange(key, start, stop);
    } catch (err) {
      console.error('Lỗi khi ZREVRANGE Redis:', err);
      return [];
    }
  }
  // 🔥 THÊM MỚI: Kiểm tra thời gian sống còn lại của một Key (giây)
  async ttl(key: string): Promise<number> {
    if (!this.isConnected) return -1;
    try {
      return await this.redisClient.ttl(key);
    } catch (err) {
      console.error('Lỗi khi lấy TTL từ Redis:', err);
      return -1;
    }
  }
  async scan(pattern: string): Promise<string[]> {
  if (!this.isConnected) return [];
  let cursor = '0';
  const keys: string[] = [];
  try {
    do {
      // Mỗi lần quét lấy ra tối đa 100 keys để không block hệ thống
      const reply = await this.redisClient.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = reply[0];
      keys.push(...reply[1]);
    } while (cursor !== '0');
    return keys;
  } catch (err) {
    console.error('Lỗi khi SCAN Redis:', err);
    return [];
  }
}

async expire(key: string, seconds: number): Promise<number> {
  if (!this.isConnected) return 0;
  try {
    return await this.redisClient.expire(key, seconds);
  } catch (err) {
    console.error('Lỗi khi EXPIRE Redis:', err);
    return 0;
  }
}
}
