import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ServerConfigType } from '../../core/src/interfaces/server-config-type.interface';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get('ConfigService');
  const config = configService.get<ServerConfigType>('server');

  const logger = new Logger('Main-Gateway');

  const configDocument = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Storage Microservice API')
    .setDescription('The storage microservice API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, configDocument);
  SwaggerModule.setup('api', app, document);

  const app = await NestFactory.create(AppModule);

//     app.setGlobalPrefix('api', {
//       exclude: [{
//         path: '',
//         method: RequestMethod.GET,
//       }]
//     });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.useGlobalFilters(new RpcCustomExceptionFilter())

    console.log('Health Check configured');

    logger.log(`Gateway running on port ${envs.port}`);

    await app.listen(config.port); //8002
}

bootstrap();
