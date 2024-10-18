import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { ImagesService } from './images.service';

describe('Images', () => {
  let app: INestApplication;
  let imageService: DeepMocked<ImagesService>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: ImagesService,
          useValue: createMock<ImagesService>(),
        },
      ],
    }).compile();

    app = module.createNestApplication();
    imageService = module.get(ImagesService);
    await app.init();
  });

  it(`/GET images without access token`, () => {
    jest.spyOn(imageService, 'getAllImages').mockResolvedValue({
      items: [],
      meta: {
        currentPage: 1,
        itemCount: 0,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0,
      },
    });
    return request(app.getHttpServer())
      .get('/images')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`/GET images`, async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'test_user', password: 'test_pass' })
      .expect(200);
    // store the jwt token for the next request
    const { access_token } = loginResponse.body;

    jest.spyOn(imageService, 'getAllImages').mockResolvedValue({
      items: [],
      meta: {
        currentPage: 1,
        itemCount: 0,
        itemsPerPage: 10,
        totalItems: 0,
        totalPages: 0,
      },
    });
    return request(app.getHttpServer())
      .get('/images')
      .set('Authorization', 'Bearer ' + access_token)
      .expect(200)
      .expect({
        ...(await imageService.getAllImages({ page: 1, pageSize: 10 })),
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
