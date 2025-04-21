import fs from 'fs';
import { S3Client, PutObjectCommand, PutObjectCommandOutput } from '@aws-sdk/client-s3';

// Initialize S3 client using environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

/**
 * Uploads a file (from multer) to S3.
 * Not used by emailController, but available for other use cases.
 */
export async function uploadFileToS3(
  file: Express.Multer.File
): Promise<PutObjectCommandOutput & { Location: string }> {
  const BUCKET_NAME = process.env.AWS_S3_BUCKET as string;
  const fileStream = fs.createReadStream(file.path);
  const timestamp = Date.now();
  const key = `input/${timestamp}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileStream,
    ContentType: file.mimetype,
    ContentDisposition: 'inline',
    ACL: 'public-read',
  });

  const result = await s3Client.send(command);
  return {
    ...result,
    Location: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
  };
}

/**
 * Uploads a raw Buffer (e.g., generated PDF) to S3.
 * This is the default export, matching emailController's import.
 */
export async function uploadBufferToS3(
  params: {
    buffer: Buffer;
    key: string;
    contentType: string;
  }
): Promise<PutObjectCommandOutput & { Location: string }> {
  const BUCKET_NAME = process.env.AWS_S3_BUCKET as string;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: params.key,
    Body: params.buffer,
    ContentType: params.contentType,
    ACL: 'public-read',
  });

  const result = await s3Client.send(command);
  return {
    ...result,
    Location: `https://${BUCKET_NAME}.s3.amazonaws.com/${params.key}`,
  };
}

// Default export for compatibility with emailController.ts
export default uploadBufferToS3;