import {ExecutionContext, Inject, Injectable, Logger, OnModuleInit} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt.payload.interface';
import { envs } from '../../config';
import { UserDto } from './dto/user.dto';
import { UserRole } from './enum/role.enum';
import {ConfigService} from "@nestjs/config";
import {LoginUserDto, RegisterUserDto} from "../../gateway/src/dto";


@Injectable()
export class UsersService  {
  configService: ConfigService
  public static users: UserDto[];

  constructor(private readonly jwt: JwtService) {
  }

  users: UserDto[]  = [
      {
        userId: 1,
        username: 'user_1',
        password: 'pass_1',
        email: 'user_1@gmail.com',
        role: UserRole.ADMIN,
      },
      {
        userId: 2,
        username: 'user_2',
        password: 'pass_2',
        email: 'user_2@gmail.com',
        role: UserRole.USER,
      },
      {
        userId: 3,
        username: 'user_3',
        password: 'pass_3',
        email: 'user_3@gmail.com',
        role: UserRole.USER,
      },
      {
        userId: 4,
        username: 'user_4',
        password: 'pass_4',
        email: 'pass_4@gmail.com',
        role: UserRole.USER,
      },
      {
        userId: 5,
        username: 'user_5',
        password: 'pass_5',
        email: 'pass_5@gmail.com',
        role: UserRole.ADMIN,
      },
      {
        userId: 6,
        username: 'user_6',
        password: 'pass_6',
        email: 'pass_6@gmail.com',
        role: UserRole.USER,
      },
      {
        userId: 7,
        username: 'user_7',
        password: 'pass_7',
        email: 'pass_7@gmail.com',
        role: UserRole.USER,
      },

    ];

  async create(user: UserDto): Promise<UserDto> {
    this.users.push((user));
    return this.users.find(user => user.username === user.username);
  }

    async findOne(email: string): Promise<UserDto> {
      return this.users.find((user) => user.email === email);
    }

    async findOneById(id: number): Promise<UserDto> {
      return this.users.find((user) => user.userId === id);
    }

    async findAll(username: string): Promise<UserDto[]> {
      return this.users.filter((user) => user.username === username);
    }


    canActivate(context: ExecutionContext): boolean {
       const request = context.switchToHttp().getRequest();
       const token = request.headers['authorization']?.split(' ')[1]
       try {
         this.jwt.verify(token)
         return true
       } catch (error) {
                 console.log(error)
        throw new RpcException({
           status: 401,
           message: 'Invalid token'
         })
         return false
       }
    }

  async signJWT(payload: JwtPayload) {
    const secret = this.configService.get<string>('JWT_SECRET')

    const [token] = await Promise.all([this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    })]);

    return {
      access_token: token,
    };
  }

  public async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async verifyToken(token: string) {
    try {

      const { sub, iat, exp, ...user } = this.jwt.verify(token, {
        secret: envs.jwtSecret,
      });

      return {
        user: user,
        token: await this.signJWT(user),
      }

    } catch (error) {
      console.log(error);
      throw new RpcException({
        status: 401,
        message: 'Invalid token'
      })
    }
  }

  async register(registerUserDto: RegisterUserDto) {
    const { username, email, password } = registerUserDto;

    try {
      const user = await this.findOne(registerUserDto.email);

      if (user) {
        throw new RpcException({
          status: 400,
          message: 'User already exists',
        });
      }

      const newUser = await this.create(
         {
          username: username,
          email: email,
          password: bcrypt.hashSync(password, 10), // TODO: encriptar / hash


      });

      const { password: __, ...rest } = newUser;

      return {
        user: rest,
        token: await this.signJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    try {
      const user = await findOne(loginUserDto.email);

      if (!user) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        throw new RpcException({
          status: 400,
          message: 'User/Password not valid',
        });
      }

      const { password: __, ...rest } = user;

      return {
        user: rest,
        token: await this.signJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
}
