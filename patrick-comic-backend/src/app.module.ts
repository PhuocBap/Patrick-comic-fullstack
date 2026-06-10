import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

// Import Redis Module chuẩn
import { RedisModule } from './service/redis.module'; 

import { TruyenService } from './service/truyen.service';
import { TruyenController } from './controllers/truyen.controller'; 
import { ChuongService } from './service/chuong.service';
import { ChuongController } from './controllers/chuong.controller'; 
import { HistoryService } from './service/history.service';
import { HistoryController } from './controllers/history.controller'; 
import { TheLoaiService } from './service/theloai.service';
import { TheLoaiController } from './controllers/theloai.controller';
import { CommentService } from './service/comment.service';
import { CommentController } from './controllers/comment.controller';
import { FollowService } from './service/follow.service';
import { FollowController } from './controllers/follow.controller';
import { UserService } from './service/user.service';
import { UserController } from './controllers/user.controller';
import { AuthService } from './service/auth.service';
import { AuthController } from './controllers/auth.controller';
import { ReportController } from './controllers/report.controller'; 
import { ReportService } from './service/report.service';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './service/admin.service';
import { CrawlService } from './service/crawl.service';

// Import các Repositories
import { TheLoaiRepository } from './repositories/theloai.repository';
import { ReportRepository } from './repositories/report.repository';
import { CommentRepository } from './repositories/comment.repository';
import { HistoryRepository } from './repositories/history.repository'; 
import { FollowRepository } from './repositories/follow.repository';
import { UserRepository } from './repositories/user.repository';
import { TruyenRepository } from './repositories/truyen.repository';
import { ChuongRepository } from './repositories/chuong.repository';
import { AdminRepository } from './repositories/admin.repository';

// 🔥 THÊM MỚI: Import ThrottlerRedisGuard chống spam
import { ThrottlerRedisGuard } from './common/guards/throttler.guard';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // 🔥 ĐƯA VÀO ĐÂY: Vì RedisModule có @Global() nên khi import ở đây, 
    // tất cả các Service khác trong hệ thống đều có thể sử dụng được luôn.
    RedisModule, 
  ],
  controllers: [
    TruyenController, 
    ChuongController,
    HistoryController,
    CommentController,
    FollowController,
    TheLoaiController, 
    UserController,
    AuthController,
    ReportController,
    AdminController, 
  ],
  providers: [
    PrismaService, 
    TheLoaiRepository,
    ReportRepository,
    CommentRepository,
    HistoryRepository, 
    FollowRepository,
    UserRepository,
    TruyenRepository,
    ChuongRepository,
    AdminRepository,
    TruyenService, 
    ChuongService,
    HistoryService,     
    CommentService,
    FollowService,
    TheLoaiService,     
    UserService,
    AuthService, 
    ReportService, 
    AdminService,   
    CrawlService,
    
    // 🔥 THÊM VÀO ĐÂY: Để NestJS biên dịch và quản lý vòng đời của Guard này
    ThrottlerRedisGuard,
  ],
  exports: [PrismaService] 
})
export class AppModule {}