import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import AWS from 'aws-sdk';
import {saveFileRecord,saveStructuredFile} from '../Helpers/SaveFileRecord';
import prismaconnection from '../db/prisma';
import fs from 'fs';
import uploadToS3 from '../Helpers/S3.Upload';
import axios from 'axios';
import detectFileType from '../Helpers/Detectfiletype';
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});



const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 'http://127.0.0.1:5000/py/structure_data';





const forwardFileToExternalService = async (termsheet_id:number) => {
  try {
    const response = await axios.post(EXTERNAL_API_URL, {termsheet_id},{
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error forwarding file to external service:', error);
    throw error;
  }
};

const function_to_upload = async (req: Request, res: Response): Promise<void> => {
    try {
        // console.log("hittin")
        // console.log(req.body)
        // console.log(req.file)
      
      if (!req.file) {
          res.status(400).json({ error: 'No file uploaded' });
        return 
      }
      const file = req.file;
      const fileType = detectFileType(file);
  
      const s3Result = await uploadToS3(file);
  
      const fileRecord = await saveFileRecord({
        fileName: file.originalname,
        termsheetname:req.body.termsheetName,
        orgid:parseInt(req.body.id),
        fileType,
        fileSize: file.size,
        s3Url: s3Result.Location,
        mimeType: file.mimetype
      });
  
      
  
      fs.unlinkSync(file.path);
      
      res.status(201).json({
        message: 'File uploaded successfully',
        fileId: fileRecord,
        url: s3Result.Location,
        // externalServiceResponse: externalResponse
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

const function_to_upload_structured_sheet= async (req: Request, res: Response): Promise<void> => {
    try {
      // console.log(req)
      if (!req.file) {
          res.status(400).json({ error: 'No file uploaded' });
        return 
      }
      const file = req.file;
      const fileType = detectFileType(file);
  
      const s3Result = await uploadToS3(file);
  
      const fileRecord = await saveStructuredFile({
        fileName: file.originalname,
        orgid:parseInt(req.body.orgId),
        fileType,
        fileSize: file.size,
        s3Url: s3Result.Location,
        mimeType: file.mimetype
      });      
      const externalResponse = await forwardFileToExternalService(fileRecord.updatedTermsheet.id);
      console.log(externalResponse)
      fs.unlinkSync(file.path);
      
      res.status(201).json({
        message: 'File uploaded successfully',
        fileId: fileRecord,
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

  const getfile = async (req: Request, res: Response) => {
    const { organisationid } = req.params;
    console.log(organisationid)
    const organisationId = parseInt(organisationid)
    if (!organisationId) {
      res.status(400).json({ error: "Missing organisationId in request body" });
      return 
    }
  
    try {
     
      const latestTermsheet = await prismaconnection.termsheet.findFirst({
        where: {
          organisationId,
          ourtermsheetFileId: { not: null },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          ourtermsheetFile: true,
        },
      });
  
      if (!latestTermsheet || !latestTermsheet.ourtermsheetFile) {
        res.status(404).json({ error: "No ourtermsheet file found for the organisation" });
        return 
      }
  
      const s3Link = latestTermsheet.ourtermsheetFile.s3Link;
      const bucket = process.env.AWS_S3_BUCKET!;
      const url = new URL(s3Link);
      const key = decodeURIComponent(url.pathname.slice(1)); // strip leading slash
  
      // Step 2: Generate the signed URL
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  
      console.log(latestTermsheet.status,signedUrl,latestTermsheet.id)
      // Include the status in the response
      res.status(200).json({ 
        url: signedUrl,
        status: latestTermsheet.status,
        termsheetId: latestTermsheet.id
      });
      return 
    } catch (error: unknown) {
      console.error("Error generating signed URL:", error);
      res.status(500).json({
        error: "Failed to generate signed URL",
        message: (error as Error).message,
      });
      return 
    }
  };


  const get_struct_file = async (req: Request, res: Response) => {
    const { organisationid } = req.params;
    console.log("get_struct_file");
    const organisationId = parseInt(organisationid);
    if (!organisationId) {
      res.status(400).json({ error: "Missing organisationId in request body" });
      return;
    }
  
    try {
      const latestTermsheet = await prismaconnection.termsheet.findFirst({
        where: {
          organisationId,
          structuredsheetFileId: { not: null },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          structuredsheetFile: true,
        },
      });
  
      if (!latestTermsheet || !latestTermsheet.structuredsheetFile) {
        res.status(404).json({ error: "No structured sheet file found for the organisation" });
        return;
      }
  
      const s3Link = latestTermsheet.structuredsheetFile.s3Link;
      const bucket = process.env.AWS_S3_BUCKET!;
      const url = new URL(s3Link);
      const key = decodeURIComponent(url.pathname.slice(1)); 
  
      // Generate the signed URL
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  
      console.log(latestTermsheet.status, signedUrl, latestTermsheet.id);
      
      // Include the status in the response
      res.status(200).json({ 
        url: signedUrl,
        status: latestTermsheet.status,
        termsheetId: latestTermsheet.id
      });
      return;
    } catch (error: unknown) {
      console.error("Error generating signed URL for structured file:", error);
      res.status(500).json({
        error: "Failed to generate signed URL for structured file",
        message: (error as Error).message,
      });
      return;
    }
  };

  const get_Validated_File = async (req: Request, res: Response) => {
    const { organisationid } = req.params;
    console.log("get_validated_file");
    console.log(organisationid);
    const organisationId = parseInt(organisationid);
    if (!organisationId) {
      res.status(400).json({ error: "Missing organisationId in request body" });
      return;
    }
  
    try {
      const latestTermsheet = await prismaconnection.termsheet.findFirst({
        where: {
          organisationId,
          validatedsheetFileId: { not: null },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          validatedsheetFile: true,
        },
      });
  
      if (!latestTermsheet || !latestTermsheet.validatedsheetFile) {
        res.status(404).json({ error: "No validated sheet file found for the organisation" });
        return;
      }
  
      const s3Link = latestTermsheet.validatedsheetFile.s3Link;
      const bucket = process.env.AWS_S3_BUCKET!;
      const url = new URL(s3Link);
      const key = decodeURIComponent(url.pathname.slice(1)); // strip leading slash
  
      // Generate the signed URL
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  
      console.log(latestTermsheet.status, signedUrl, latestTermsheet.id);
      
      // Include the status in the response
      res.status(200).json({ 
        url: signedUrl,
        status: latestTermsheet.status,
        termsheetId: latestTermsheet.id
      });
      return;
    } catch (error: unknown) {
      console.error("Error generating signed URL for validated file:", error);
      res.status(500).json({
        error: "Failed to generate signed URL for validated file",
        message: (error as Error).message,
      });
      return;
    }
  };
  
  const get_discrepancies = async (req: Request, res: Response) => {
    try {
      const { organisationid } = req.params;
      const userId = req.userId;
  
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
  
      const userOrganization = await prismaconnection.userOrganisation.findUnique({
        where: {
          userId_organisationId: {
            userId: parseInt(userId),
            organisationId: parseInt(organisationid),
          },
        },
        select: {
          role: true,
        },
      });
  
      if (!userOrganization) {
        res.status(403).json({
          success: false,
          message: 'User does not belong to this organization',
        });
        return;
      }
  
      const role = userOrganization.role;
      const isAdmin = role.toLowerCase() === 'admin';
  
      const termsheet = await prismaconnection.termsheet.findFirst({
        where: {
          organisationId: parseInt(organisationid),
          status: { not: "COMPLETED" },
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
        },
      });
  
      if (!termsheet) {
        res.status(300).json({
          success: false,
          message: 'No active termsheet found for this organization',
          role, // even in fallback, return the role
        });
        return;
      }
  
      const discrepancies = await prismaconnection.discrepancy.findMany({
        where: {
          termsheetId: termsheet.id,
          ...(isAdmin ? {} : { role }),
        },
        select: {
          id: true,
          role: true,
          //@ts-ignore
          field: true,
          content: true,
          suggestion: true,
          score: true,
          acceptedbyrole: true,
          acceptedbyadmin: true,
          createdAt: true,
        },
      });
  
      const formattedDiscrepancies = discrepancies.map((disc) => ({
        ...disc,
        //@ts-ignore
        score: disc.score ? parseFloat(disc.score) : undefined,
      }));
  
      res.status(200).json({
        success: true,
        role, // return the user's role in the response
        data: formattedDiscrepancies,
      });
    } catch (error: any) {
      console.error('Error fetching discrepancies:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch discrepancies',
        error: error.message,
      });
    }
  };
  
  export default get_discrepancies;


export  {function_to_upload , getfile, function_to_upload_structured_sheet,get_struct_file,get_Validated_File,get_discrepancies}
