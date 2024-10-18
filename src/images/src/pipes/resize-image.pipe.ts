import { Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';
import { ImageDto } from '../dto/image.dto';

@Injectable()
export class ResizeImagePipe implements PipeTransform<Express.Multer.File, Promise<ImageDto>>
{
  async transform(image: Express.Multer.File): Promise<ImageDto> {
    const originalFileName = image.originalname.split('.')[0];
    const originalSize = image.size;
    const buffer = await sharp(image.buffer)
      .rotate()
      .resize({ width: 600, height: 800, withoutEnlargement: true })
      .webp({ effort: 3 })
      .toBuffer();
    const compressedSize = Buffer.byteLength(buffer);
    return { originalFileName, originalSize, compressedSize, buffer };
  }
}
