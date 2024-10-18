import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ImageEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  folderName: string;

  @Column()
  tenant: string;

  @Column()
  userId: number;

  @Column()
  searchableFileName: string;

  @Column()
  originalFileName: string;

  @Column()
  firebaseFileName: string;

  @Column()
  uploadDate: Date;

  @Column({ default: 0 })
  originalSize: number;

  @Column({ default: 0 })
  compressedSize: number;

  @Column()
  url: string;
}
