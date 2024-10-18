import { ApiProperty } from '@nestjs/swagger';
import { ImageEntity } from './entities/image.entity';

export class ImageResponseDto extends ImageEntity {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  image: Buffer;
}
