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
          ourtermsheetFileId: fileRecord.id
        }
      });
      
      return {
        termsheet,
        fileRecord
      };
    } catch (error) {
      console.error('Prisma error:', error);
      throw error;
    }
  };


  const saveStructuredFile = async (fileData: {
    fileName: string;
    fileType: string;
    fileSize: number;
    s3Url: string;
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
      
      // Find the latest termsheet for this organization
      const latestTermsheet = await prismaconnection.termsheet.findFirst({
        where: {
          organisationId: fileData.orgid,
          ourtermsheetFileId: { not: null }, // Ensure it has a termsheet file
        },
        orderBy: {
          createdAt: 'desc', // Get the most recent one
        }
      });
      
      if (!latestTermsheet) {
        throw new Error("No termsheet found for this organization");
      }
      
      // Update the found termsheet
      const updatedTermsheet = await prismaconnection.termsheet.update({
        where: {
          id: latestTermsheet.id // Use the ID of the found termsheet
        },
        data: {
          mapsheetFileId: fileRecord.id,
          status: "TO BE VALIDATED" 
        }
      });
      
      console.log("File record created:", fileRecord);
      console.log("Termsheet updated:", updatedTermsheet);
      
      return {
        fileRecord,
        updatedTermsheet
      };
    } catch (error) {
      console.error('Prisma error:', error);
      throw error;
    }
  };

export {saveFileRecord,saveStructuredFile}