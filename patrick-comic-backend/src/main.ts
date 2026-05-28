import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Global Prefix: API của ông sẽ bắt đầu bằng /api
  // Ví dụ: http://localhost:3001/api/truyen
  app.setGlobalPrefix('api');

  // 3. Validation Pipe: Tự động kiểm tra dữ liệu
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  console.log(`--- PATRICCOMIC BACKEND ---`);
  console.log(`🚀 Server is running on: http://localhost:${port}/api`);
}
bootstrap();