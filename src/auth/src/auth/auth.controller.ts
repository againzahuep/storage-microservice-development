import { Controller } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto';

import { ClassSerializerInterceptor, Body, Controller, HttpCode, HttpStatus, Post, Get, Post, SerializeOptions, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './auth.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Controller('auth')
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientProxy,
              @Inject(USERS_SERVICE) private readonly clientUsers: ClientProxy
  ) {}


  @MessagePattern('do_register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.client.send('register_user', registerUserDto)
   .pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }

  @MessagePattern('do_login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.client.send('login_user', loginUserDto).pipe(
      catchError((error) => {
        throw new RpcException(error);
      }),
    );
  }


}
