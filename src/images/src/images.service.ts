import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import {
  Inject,
  Injectable,
  CACHE_MANAGER,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ILike, Repository } from 'typeorm';
import { Logger } from 'winston';
import { ImageEntity } from './dto/entities/image.entity';
import { ImageDto } from './dto/image.dto';
import { PaginationResultDto } from './pagination/pagination-result.dto';
import { PaginationDto } from './pagination/pagination.dto';
import { FirebaseService } from './firebase/firebase.service';
import {RedisCacheService} from "./redis/redis-cache.service";
import * as fs from 'fs';
import { createThumbnail } from './utils/image.utils';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(ImageEntity)
    private readonly imageRepository: Repository<ImageEntity>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly firebaseService: FirebaseService,
    private readonly cache: RedisCacheService,
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<ImageEntity> {

    const fileUrl = await this.firebaseService.uploadImage(file);
    // Validate file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('File size exceeds limit of 2MB');
    }

    // Validate file type (accept only images)
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only JPEG and PNG are allowed');
    }

    // Generate thumbnail
    const thumbnailBuffer = await createThumbnail(file);
    fs.writeFileSync(`./thumbnails/${file.originalname}`, thumbnailBuffer);

    // Save image metadata to database
    const image = this.imageRepository.create({
      originalFileName: file.originalname,
      url: fileUrl,
    });
    await this.imageRepository.save(image);

    // Cache image URL in Redis
    await this.cacheManager.set(file.originalname, fileUrl);

    // @ts-ignore
    return fileUrl;

  }

  async getFileUrl(fileName: string): Promise<string> {
    // Check cache first
    const cachedUrl = await this.cacheManager.get(fileName);
    if (cachedUrl) return cachedUrl as string;

    // If not in cache, retrieve from Firebase and cache it
    const fileUrl = await this.firebaseService.getFileUrl(fileName);
    await this.cacheManager.set(fileName, fileUrl);

    return fileUrl;
  }

  async getImageById(id: number): Promise<ImageDto> {
    const imageEntity = await this.imageRepository.findOne({ where: { id } });
    if (!imageEntity) {
      throw new NotFoundException(`Image with id ${id} not found`);
    }
    const buffer = await this.getImageBufferFromUrl(imageEntity.url);
    return { ...imageEntity, buffer };
  }

  async getImageByName(name: string): Promise<ImageDto> {
    const imageEntity = await this.imageRepository.findOne({
      where: { searchableFileName: ILike(`%${name}%`) },
    });
    if (!imageEntity) {
      throw new NotFoundException(`Image with name '${name}' not found`);
    }
    const buffer = await this.getImageBufferFromUrl(imageEntity.url);
    return { ...imageEntity, buffer };
  }

  async getAllImages(
    paginationData: PaginationDto,
  ): Promise<PaginationResultDto<ImageEntity>> {
    const offset = (paginationData.page - 1) * paginationData.pageSize;
    const [items, total] = await this.imageRepository.findAndCount({
      skip: offset,
      take: paginationData.pageSize,
      where: {
        ...(paginationData.filter?.tenant && {
          tenant: paginationData.filter.tenant,
        }),
        ...(paginationData.filter?.userId && {
          userId: paginationData.filter.userId,
        }),
        ...(paginationData.filter?.folderName && {
          folderName: paginationData.filter.folderName,
        }),
      }
    });

    return {
      items,
      meta: {
        currentPage: paginationData.page,
        itemCount: items.length,
        itemsPerPage: paginationData.pageSize,
        totalPages: Math.ceil(total / paginationData.pageSize),
        totalItems: total,
      },
    };
  }

  async deleteImage(id: number) {
    const image = await this.getImageById(id);
    if (image instanceof ImageEntity) {
      await this.firebaseService.deleteImage(image);
    }
    await this.imageRepository.delete(id);
    this.logger.info(
      `User '${image.userId}' deleted image '${image.firebaseFileName}' from folder '${image.tenant}/${image.userId}/${image.folderName}'`,
    );
  }

  async getImageBufferFromUrl(url: string) {
    let buffer = await this.cache.get<Buffer>(url);
    if (!buffer) {
      const response = await this.httpService.axiosRef({
        url,
        method: 'GET',
        responseType: 'arraybuffer',
      });
      const responseBuffer = Buffer.from(response.data, 'binary');

      try {
        await this.cache.set(url, responseBuffer);
      } catch (error) {
        throw new InternalServerErrorException(`Error when storing in cache`);
      }
      buffer = JSON.parse(JSON.stringify(responseBuffer));
    }
    return buffer;
  }
}
