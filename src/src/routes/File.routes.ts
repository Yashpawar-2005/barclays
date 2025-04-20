import { Router } from "express";
import { Request } from 'express';

import { authenticate } from "../middlewares/Authcheck";
import {function_to_upload, function_to_upload_structured_sheet, getfile, get_struct_file, get_Validated_File, get_discrepancies} from "../controllers/File.controller";
import multer from "multer";
import fs from 'fs'

const filerouter=Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFiltera = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
      // Documents
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
      'application/pdf', // PDF
      // Excel
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      // Web content
      'text/html',
      'application/xml',
      // Others
      'text/plain', // For meeting minutes in text format
      'application/json'
    ];
  
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  };
  
  // Configure multer
  const upload = multer({
    storage: storage,
    fileFilter: fileFiltera
  });
  




filerouter.post("/upload",authenticate,upload.single('file'),function_to_upload);
filerouter.post("/upload_structured",authenticate,upload.single('file'),function_to_upload_structured_sheet)
filerouter.get("/termsheet/:organisationid",authenticate,getfile)
filerouter.get("/validated_termsheet/:organisationid",authenticate,get_Validated_File)
filerouter.get("/structured_termsheet/:organisationid",authenticate,get_struct_file);
filerouter.get("/termsheet/discrepancies/:organisationid",authenticate,get_discrepancies)
filerouter.post("/getfile",authenticate,getfile)
export default filerouter