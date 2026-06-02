import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Cấu hình CORS mở rộng cho cả môi trường dev và production
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      /\.onrender\.com$/ // Cho phép tất cả các sub-domain từ Render gọi tới API
    ], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Global Prefix: API sẽ bắt đầu bằng /api
  app.setGlobalPrefix('api');

  // 3. Validation Pipe: Tự động kiểm tra dữ liệu
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 4. Sửa đổi cổng để tương thích 100% với Render Cloud
  const port = process.env.PORT ?? 10000; 
  
  // QUAN TRỌNG: Thêm '0.0.0.0' để mở cổng ra môi trường Internet public của Render
  await app.listen(port, '0.0.0.0');
  
  console.log(`--- PATRICCOMIC BACKEND ---`);
  console.log(`🚀 Server is running on port: ${port}`);
}
bootstrap();