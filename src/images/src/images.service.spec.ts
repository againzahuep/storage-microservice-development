import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { Logger } from 'winston';
import { FirebaseService } from '../firebase/firebase.service';
import { RedisCacheService } from '../redis/redis-cache.service';
import { ImageEntity } from './dto/entities/image.entity';
import { ImagesService } from './images.service';

describe('ImagesService', () => {
  let imageService: ImagesService;
  let imageRepository: DeepMocked<Repository<ImageEntity>>;
  let cacheService: DeepMocked<RedisCacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: getRepositoryToken(ImageEntity),
          useValue: createMock<Repository<ImageEntity>>(),
        },
        {
          provide: FirebaseService,
          useValue: createMock<FirebaseService>(),
        },
        {
          provide: RedisCacheService,
          useValue: createMock<RedisCacheService>(),
        },
        {
          provide: HttpService,
          useValue: createMock<HttpService>(),
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: createMock<Logger>(),
        },
      ],
    }).compile();

    imageService = module.get<ImagesService>(ImagesService);
    imageRepository = module.get(getRepositoryToken(ImageEntity));
    cacheService = module.get(RedisCacheService);
  });

  it('should be defined', () => {
    expect(imageService).toBeDefined();
  });

  it('valid image ID to return image dto', async () => {
    const id = 1;
    const imageEntity: ImageEntity = {
      id: 33,
      folderName: 'images',
      tenant: 'tenant 1',
      userId: 1,
      searchableFileName: 'La costa',
      originalFileName: 'IMG_20230210_174325',
      firebaseFileName: 'test Image',
      uploadDate: new Date(),
      originalSize: 4858847,
      compressedSize: 136546,
      url: 'http:localhost:3000',
    };
    const buffer = {
      type: 'Buffer',
      data: [1, 2, 3],
    };
    const espectedResult = { ...imageEntity, buffer };

    jest.spyOn(imageRepository, 'findOne').mockResolvedValue(imageEntity);
    jest.spyOn(cacheService, 'get').mockResolvedValue(buffer);

    const result = await imageService.getImageById(id);

    expect(imageRepository.findOne).toHaveBeenCalled();
    expect(imageRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });

    expect(cacheService.get).toHaveBeenCalled();
    expect(cacheService.get).toHaveBeenCalledWith(imageEntity.url);

    expect(result).toEqual(espectedResult);
  });

  it('return NotFoundException if no image was found', async () => {
    const id = 10000;
    jest.spyOn(imageRepository, 'findOne').mockResolvedValue(null);

    await expect(imageService.getImageById(id)).rejects.toThrow(
      NotFoundException,
    );

    expect(imageRepository.findOne).toHaveBeenCalled();
    expect(imageRepository.findOne).toHaveBeenCalledWith({ where: { id } });
  });
});
