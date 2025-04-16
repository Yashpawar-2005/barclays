import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { Express } from 'express';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1' ,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});
export {s3Client}

const uploadToS3 = async (file: Express.Multer.File) => {
  const fileStream = fs.createReadStream(file.path);
  const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'my-file-upload-bucket';

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `input/${Date.now()}-${file.originalname}`,
    Body: fileStream,
    ContentType: file.mimetype,
    ContentDisposition: 'inline',
     ACL: 'public-read'
  });
  

  try {
    const result = await s3Client.send(command);
    return {
      ...result,
      Location: `https://${BUCKET_NAME}.s3.amazonaws.com/input/${Date.now()}-${file.originalname}`
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
};

export default uploadToS3;
