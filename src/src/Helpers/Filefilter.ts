import multer from "multer";
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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

export default fileFilter