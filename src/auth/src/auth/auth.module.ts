import { Module } from '@nestjs/common';
import * as path from 'path';
import { AuthController } from '../controllers/auth.controller';
import { ConfigModule } from '../config/config.module';
import { envs } from './config';

@Module({
  controllers: [AuthController],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.join(__dirname.replace(/\/dist/, ''), '.env'),
      isGlobal: true,
      load: [
        () => ({
          server: {
            host: process.env.HOST,
            port: process.env.PORT,
          },
        }),
      ],
    }),
    JwtModule.register({
      global: true,
      secret: envs.jwtSecret,
      signOptions: { expiresIn: '2h' },
    }),
  ]
})
export class AuthModule {}
