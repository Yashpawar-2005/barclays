import prismaconnection from "../db/prisma";

const saveFileRecord = async (fileData: {
    fileName: string;
    fileType: string;
    fileSize: number;
    s3Url: string;
    termsheetname: string,
    orgid: number,
    mimeType: string;
  }) => {
    try {
      // First, create the File record
      const fileRecord = await prismaconnection.file.create({
        data: {
          s3Link: fileData.s3Url,
          type: fileData.fileType
        }
      });
      console.log(fileRecord)
      console.log(fileData)
      const termsheet = await prismaconnection.termsheet.create({
        data: {
          title: fileData.termsheetname,
          organisationId: fileData.orgid,
          //@ts-ignore
          ourtermsheetFileId: fileRecord.id
        }
      });
      
      return {
        // termsheet,
        fileRecord
      };
    } catch (error) {
      console.error('Prisma error:', error);
      throw error;
    }
  };

export default saveFileRecord;