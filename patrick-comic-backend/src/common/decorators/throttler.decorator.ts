// Tạo file src/common/decorators/throttler.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Throttle = (limit: number, windowInSeconds: number) => {
  return (target: any, key: any, descriptor: any) => {
    SetMetadata('throttlerLimit', limit)(target, key, descriptor);
    SetMetadata('throttlerWindow', windowInSeconds)(target, key, descriptor);
  };
};