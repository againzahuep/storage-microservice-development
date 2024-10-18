import {
    BadRequestException,
    Body,
    Inject,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Req,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiProduces,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { catchError } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';
import {CURRENT_USER} from "./decorator/current-user.decorator";
import {PaginationDto} from "../../images/src/pagination/pagination.dto";
import { Response } from 'express';

@Controller()
export class AppController {

    constructor(
        @Inject('AUTH_SERVICE')
        private readonly clientAuth: ClientProxy,
        @Inject('IMAGES_SERVICE')
        private readonly clientImages: ClientProxy,
        @Inject('USERS_SERVICE')
        private readonly clientUsers: ClientProxy
    ) {
    }

    public async onApplicationBootstrap() {
        await this.clientUsers.connect();
        await this.clientImages.connect();
        await this.clientAuth.connect();
    }

    @Post('/login')
    public login(@Body() loginUserDto: LoginUserDto) {
        return this.clientAuth.send('do_login', {LoginUserDto})
            .pipe(
                catchError((error) => {
                    throw new RpcException(error);
                }),
            );
    }

    @Post('/register')
    public register(@Body() registerUserDto: RegisterUserDto) {
        return this.clientAuth.send('do_register', {registerUserDto})
            .pipe(
                catchError((error) => {
                    throw new RpcException(error);
                }),
            );
    }

    @Get('findOne')
    @ApiQuery({ name: 'id', required: false, type: String })
    @ApiQuery({ name: 'name', required: false, type: String })
    @ApiResponse({
        schema: {
            type: 'string',
            format: 'binary',
        },
        status: HttpStatus.OK,
    })
    @ApiProduces('image/webp')
    async getOneImage(
        @Res() res: Response,
        @Query('id') id?: string,
        @Query('name') name?: string,
    ) {
       this.clientImages.send('do_getOneImage',{res,id,name});
    }

    @Post('/upload')
    @UseInterceptors(FileInterceptor('file'))
    public upload(
        @UploadedFile(
//       new ParseFilePipe({
//         validators: [
//           new MaxFileSizeValidator({ maxSize: 1000 }),
//           new FileTypeValidator({ fileType: 'image/jpeg' }),
//           new FileTypeValidator({ fileType: 'image/png' }),
//         ],
//       }),
        )
            file: Express.Multer.File, @Req() req) {
        if (file.size > 2 * 1024 * 1024) {
            throw new Error('File size exceeds limit of 2MB');
        }

        // Validate file type (accept only images)
        const validTypes = ['image/jpeg', 'image/png'];

        if (!validTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Only JPEG and PNG are allowed');
        }

        if (req.user === CURRENT_USER) {
            return this.clientImages.send('do_upload', {file.filename, file.buffer})
                .pipe(
                    catchError((error) => {
                        throw new RpcException(error);
                    }),
                );
        }
        return;
    }

    @Get('/images')
    public getAllImages(@Query() query?: PaginationDto){
        return await this.clientImages.send('do_getAllImages', {query}).pipe(
            catchError((error) => {
                throw new RpcException(error);
            }),
        );
    }

  @Delete(':id')
  public deleteImage(@Param('id', ParseIntPipe) id: number) {
    return await this.clientImages.send('do_deleteImage', {id})
    .pipe(
       catchError((error) => {
         throw new RpcException(error);
       }),
    );
  }

}
