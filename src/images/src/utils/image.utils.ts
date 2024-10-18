import * as sharp from 'sharp';

export async function createThumbnail(file: Express.Multer.File): Promise<Buffer> {
  return await sharp(file.buffer)
    .resize({ width: 200 })
    .toBuffer();
}
