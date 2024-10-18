import { Inject, Injectable } from '@nestjs/common';
import { app } from 'firebase-admin';
import {ImageEntity} from "../dto/entities/image.entity";


@Injectable()
export class FirebaseService {
  private bucket: any;
  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.bucket = this.firebaseApp.storage().bucket(this.firebaseApp.options.storageBucket);

  }

  async getFileUrl(fileName: string): Promise<string> {
    const fileRef = this.bucket.file(fileName);
    return fileRef.publicUrl();
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
     const fileName = `${Date.now()}_${file.originalname}`;
     const fileRef = this.bucket.file(fileName);



     /*
        const processedBuffer: Buffer = file.buffer;
        const blobStream = fileRef.createWriteStream({
           metadata: {
             contentType: 'image/webp',
           },
        });

        blobStream.end(processedBuffer);

        await new Promise<void>((resolve, reject) => {
          blobStream.on('finish', resolve);
          blobStream.on('error', reject);
        });
        */
     await fileRef.save(file.buffer);
     return fileRef.publicUrl();
  }

  async deleteImage(imageData: ImageEntity) {
    const file = this.bucket.file(imageData.firebaseFileName);

    try {
      await file.delete();
    } catch (error) {
      console.error(`Error deleting file ${file.originalname}:`, error);
      throw error;
    }
  }
}
