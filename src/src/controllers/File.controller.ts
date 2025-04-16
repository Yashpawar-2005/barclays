import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import AWS from 'aws-sdk';
import saveFileRecord from '../Helpers/SaveFileRecord';
import prismaconnection from '../db/prisma';
import fs from 'fs';
import uploadToS3 from '../Helpers/S3.Upload';
import axios from 'axios';
import detectFileType from '../Helpers/Detectfiletype';
import FormData from 'form-data';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});



const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 'http://your-backend-api.com/process';




// File filter function


// Forward file to external service
const forwardFileToExternalService = async (file: Express.Multer.File, fileType: string) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));
    formData.append('fileType', fileType);
    
    const response = await axios.post(EXTERNAL_API_URL, formData, {
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });
    
    return response.data;
  } catch (error) {
    console.error('Error forwarding file to external service:', error);
    throw error;
  }
};

// File upload endpoint
const function_to_upload = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("hittin")
        console.log(req.file)
      if (!req.file) {
          res.status(400).json({ error: 'No file uploaded' });
        return 
      }
  
      const file = req.file;
      const fileType = detectFileType(file);
  
      const s3Result = await uploadToS3(file);
  
      const fileRecord = await saveFileRecord({
        fileName: file.originalname,
        fileType,
        fileSize: file.size,
        s3Url: s3Result.Location,
        mimeType: file.mimetype
      });
  
      const externalResponse = await forwardFileToExternalService(file, fileType);
  
      fs.unlinkSync(file.path);
  
      res.status(201).json({
        message: 'File uploaded successfully',
        fileId: fileRecord.id,
        url: s3Result.Location,
        externalServiceResponse: externalResponse
      });
      return 
    } catch (error: any) {
      console.error('Error processing file upload:', error);
      res.status(500).json({
          error: 'Failed to process file upload',
          message: error.message
        });
        return
    }
  };
  






  import { GetObjectCommand } from '@aws-sdk/client-s3';
  import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
  import { s3Client } from '../Helpers/S3.Upload';

  const getfile=async (req: Request, res: Response) => {
    const { key } = req.body;
    console.log(key)
    if (!key) {
      return res.status(400).json({ error: 'Missing file key in URL' });
    }
  
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
      });
  
      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 30000, 
      });
      console.log("returning")
      return res.status(200).json({ url: signedUrl });
    } catch (error: unknown) {
      console.error('Error generating signed URL:', error);
  
      return res.status(500).json({
        error: 'Failed to generate signed URL',
        message: (error as Error).message,
      });
    }
  }
  
export  {function_to_upload,getfile}
