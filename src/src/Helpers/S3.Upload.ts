import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


// Hardcoded credentials
const s3Client = new S3Client({
  region: 'ap-south-1', // Ensure the correct region is here
  credentials: {
    accessKeyId: 'AKIAVRUVTFUOE2VC274F',
    secretAccessKey: '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',
  },
});

export { s3Client };

const uploadToS3 = async (file: Express.Multer.File) => {
  const fileStream = fs.createReadStream(file.path);
  console.log(process.env.AWS_REGION, process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY, process.env.AWS_S3_BUCKET)
  
  const BUCKET_NAME = 'barcla'; // Ensure the bucket name is correct
  const timestamp = Date.now();
  const key = `input/${timestamp}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileStream,
    ContentType: file.mimetype,
    ContentDisposition: 'inline',
    ACL: 'public-read', // If you want the file to be publicly accessible
  });

  try {
    const result = await s3Client.send(command);
    return {
      ...result,
      Location: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw error;
  }
};

export default uploadToS3;
