import prismaconnection from "../db/prisma";
const saveFileRecord = async (fileData: {
    fileName: string;
    fileType: string;
    fileSize: number;
    s3Url: string;
    mimeType: string;
  }) => {
    try {
      const fileRecord = await prismaconnection.file.create({
        data: {
        //   fileName: fileData.fileName,
        //   fileType: fileData.fileType,
        //   fileSize: fileData.fileSize,
          type:fileData.fileType,
          s3Link: fileData.s3Url
        //   s3Key: fileData.s3Key,
        //   mimeType: fileData.mimeType,
        //   uploadedAt: new Date()
        }
      });
      
      return fileRecord;
    } catch (error) {
      console.error('Prisma error:', error);
      throw error;
    }
  };

export default saveFileRecord