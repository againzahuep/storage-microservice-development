import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  BadRequestException,
  Logger,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import {
  MicroserviceOptions,
  TcpClientOptions,
  Transport,
} from '@nestjs/microservices';

import { AuthModule } from './auth/auth.module';
import { ServerConfigType } from '../../core/src/interfaces/server-config-type.interface';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  const configService: ConfigService = app.get('ConfigService');
  const config = configService.get<ServerConfigType>('server');

  app.setGlobalPrefix('api', {
    exclude: [{
      path: '',
      method: RequestMethod.GET,
    }]
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new RpcCustomExceptionFilter())

  await app.listen(config.port);

}

bootstrap();
