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
import uploadBufferToS3 from "../Helpers/uploadtos3";
import fetch from "node-fetch";
import { fetchOrderEmail, buildCombinedPdfBuffer } from './emailcontroller';
// import uploadBufferToS3 from '../Helpers/uploadtos3';
// import { saveFileRecord } from '../Helpers/SaveFileRecord';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'ap-south-1'
});

const IMAP_HOST = process.env.IMAP_HOST!;
const IMAP_PORT = parseInt(process.env.IMAP_PORT!, 10);
const IMAP_TLS  = process.env.IMAP_TLS === 'true';


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
    console.log("🔥 req.file:", req.file);
  console.log("🔥 req.body:", req.body);
    if (!req.file) {
      console.log("darshan");
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    console.log("hii");
    const file = req.file;
    const fileType = detectFileType(file);
    const orgId = parseInt(req.body.id);
console.log("h")
console.log(orgId)
    // First handle the termsheet status update
    try {
      console.log("yash");
      // Find the latest termsheet for this organization
      const latestTermsheet = await prismaconnection.termsheet.findFirst({
        where: { organisationId: orgId },
        orderBy: { createdAt: 'desc' }
      });
      console.log("hi")
      console.log("fdk");
      console.log(latestTermsheet)

      // Update the status if found
      if (latestTermsheet) {
        await prismaconnection.termsheet.update({
          where: { id: latestTermsheet.id },
          data: { status: "REJECTED" }
        });
      }
    } catch (dbError) {
      console.error('Database error when updating termsheet status:', dbError);
      // Continue with the file upload process even if the DB update fails
    }

    // Now proceed with the S3 upload
    const s3Result = await uploadToS3(file);
console.log(orgId)
    const fileRecord = await saveFileRecord({
      fileName: file.originalname,
      termsheetname: req.body.termsheetName,
      orgid: orgId,
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
    });
    return;
  } catch (error: any) {
    console.error('Error processing file upload:', error);

    res.status(500).json({
      error: 'Failed to process file upload',
      message: error.message
    });
    return;
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

  export const uploadFromEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, orderId, termsheetName, id: orgIdRaw } = req.body as {
        email: string;
        password: string;
        orderId: string;
        termsheetName: string;
        id: string;
      };
      const organisationId = parseInt(orgIdRaw, 10);
  
      if (!email || !password || !orderId || !termsheetName || isNaN(organisationId)) {
        res.status(400).json({ message: 'Missing or invalid params' });
        return;
      }
  
      // 1) Fetch email via IMAP
      const mail = await fetchOrderEmail(
        { user: email, password, host: IMAP_HOST, port: IMAP_PORT, tls: IMAP_TLS },
        orderId
      );
  
      // 2) Parse key/value pairs from mail.text
      const data: Record<string, string> = {};
      if (mail.text) {
        mail.text.split(/\r?\n/).filter(line => line.includes(':')).forEach(line => {
          const [k, ...rest] = line.split(':');
          data[k.trim()] = rest.join(':').trim();
        });
      }
  
      // 3) Build combined PDF
      const pdfBuffer = await buildCombinedPdfBuffer(orderId, data, mail.text || '', mail.attachments || []);
  
      // 4) Upload buffer to S3
      const s3Key = `email/${organisationId}-${orderId}-${Date.now()}.pdf`;
      const { Location } = await uploadBufferToS3({ buffer: pdfBuffer, key: s3Key, contentType: 'application/pdf' });
  
      // 5) Save record
      const fileRecord = await saveFileRecord({
        fileName:      `${termsheetName.replace(/\s+/g, '_')}.pdf`,
        termsheetname: termsheetName,
        orgid:         organisationId,
        fileType:      'ourtermsheet',
        fileSize:      pdfBuffer.byteLength,
        s3Url:         Location,
        mimeType:      'application/pdf',
      });
  
      // 6) Respond
      res.status(201).json({
        message:   'Extracted and uploaded termsheet',
        url:        Location,
        termsheet:  fileRecord.termsheet,
      });
    } catch (err: any) {
      console.error('uploadFromEmail error:', err);
      res.status(500).json({ message: err.message || 'Internal server error during email extraction' });
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
