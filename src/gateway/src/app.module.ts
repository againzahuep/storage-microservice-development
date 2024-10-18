import { ClientsModule, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';

import { Module, MiddlewareConsumer } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from 'src/config';
import { format, transports } from 'winston';

import { AuthController } from './app.controller';
import { AuthConfigType } from '../../core/src/interfaces/auth.config.type.interface';
import { ImagesConfigType } from '../../core/src/interfaces/images.config.type.interface';
import { UsersConfigType } from '../../core/src/interfaces/users.config.type.interface';
import { CoreModule } from '../../core/core.module';

@Module({
  controllers: [AppController],
  imports: [
    CoreModule,
    ConfigModule.forRoot({
      envFilePath: path.join(__dirname.replace(/\/dist/, ''), '.env'),
      isGlobal: true,
      load: [
        () => ({
          server: {
            port: process.env.PORT,
            host: process.env.HOST
          },
          auth: {
            host: process.env.AUTH_SERVICE_HOST,
            port: process.env.AUTH_SERVICE_PORT,
          },
          images: {
            host: process.env.IMAGES_SERVICE_HOST,
            port: process.env.IMAGES_SERVICE_PORT,
          },
        }),
      ],
    }),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const config = configService.get<AuthConfigType>('auth');
          return {
            transport: Transport.NATS,
            options: {
              servers: envs.natsServers,
            },
          };
        },
      },
      {
        name: 'IMAGES_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const config = configService.get<ImagesConfigType>('images');
          return {
            transport: Transport.NATS,
            options: {
                servers: envs.natsServers,
            },
          };
        },
      },
      {
         name: 'USERS_SERVICE',
         imports: [ConfigModule],
         inject: [ConfigService],
         useFactory: (configService: ConfigService) => {
           const config = configService.get<UsersConfigType>('users');
           return {
             transport: Transport.NATS,
             options: {
               servers: envs.natsServers,
             },
           };
         },
       },

    ]),
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(AuditMiddleware).forRoutes('../../assets');
//   }
}
