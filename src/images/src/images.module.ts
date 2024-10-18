import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { AuditMiddleware } from './middlewares/audit.middleware';
import { HealthCheckModule } from './health-check/health-check.module';
import { FirebaseModule } from './firebase/firebase.module';
import { ImagesModule } from './images/images.module';
import { UsersModule } from './users/users.module';
import { RedisCacheModule } from './redis/redis-cache.module';
import { RedisCacheService } from '../redis/redis-cache.service';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { ImageEntity } from './dto/entities/image.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module, MiddlewareConsumer } from '@nestjs/common';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, RedisCacheService],
  imports: [
    TypeOrmModule.forFeature([ImageEntity]),
    AuditMiddleware,
    ConfigModule,
    FirebaseModule,
    ImagesModule,
    UsersModule,
    RedisCacheModule,
    AuditMiddleware,
    HttpModule,
    WinstonModule.forRoot({
      transports: [
        new transports.Console({
          format: format.combine(
            format.cli(),
            format.splat(),
            format.timestamp({ format: 'DD/MM/YYYY, hh:mm:ss' }),
            format.printf((info) => {
              return `[${info.timestamp}]: ${info.message}`;
            }),
          ),
        }),
        new transports.File({
          filename: `logs/images.log`,
          format: format.combine(
            format.timestamp({ format: 'DD/MM/YYYY, hh:mm:ss' }),
            format.printf((info) => {
              return `[${info.timestamp}]: ${info.message}`;
            }),
          ),
        }),
      ],
    }),
  ],
})
export class ImagesModule {
  constructor(private configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditMiddleware).forRoutes('../../assets');
  }
}