import {
  BadRequestException,
  Body,
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
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiProduces,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ImageDto } from './dto/image.dto';
import { ImagesService } from './images.service';
import { PaginationDto } from './pagination/pagination.dto';
import { ResizeImagePipe } from './pipes/resize-image.pipe';
import { MessagePattern, Payload } from '@nestjs/microservices';

// @ApiBearerAuth()
@Controller('images')
// @ApiTags('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @MessagePattern('do_getAllImages')
  async getAllImages(@Payload() query?: PaginationDto) {
    return await this.imagesService.getAllImages(query);
  }

  @MessagePattern('do_getOneImage')
  async getImage(
    @Payload() res: Response,
    @Payload() id?: string,
    @Payload() name?: string,
  ) {
    if (!id && !name) {
      throw new BadRequestException(
        `You must provide at least one of these arguments: 'id' or 'name'`,
      );
    }
    let imageDto = null;
    if (id) {
      imageDto = await this.imagesService.getImageById(+id);
    } else if (name) {
      imageDto = await this.imagesService.getImageByName(name);
    }

    const buffer: any = imageDto.buffer;
    const mimeType = 'image/webp';
    const b64 = Buffer.from(buffer.data, 'base64');
    res.contentType(mimeType);
    res.attachment(`${imageDto.firebaseFileName}.webp`);
    res.send(b64);
  }

  @MessagePattern('do_upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Payload() file) {

    return await this.imagesService.uploadImage(file);
  }

  @MessagePattern('do_deleteImage')
  async deleteImage(@Payload() id: number) {
    return await this.imagesService.deleteImage(id);
  }

  @Get(':fileName')
  async getFileUrl(@Payload() fileName: string) {
    return this.imagesService.getFileUrl(fileName);
  }
}
