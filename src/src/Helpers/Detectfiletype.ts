import path from "path";
const detectFileType = (file: Express.Multer.File): string => {
    const mimeType = file.mimetype;
    const extension = path.extname(file.originalname).toLowerCase();
    
    // Document types
    if (mimeType.includes('wordprocessingml') || extension === '.docx' || extension === '.doc') {
      return 'WORD_DOCUMENT';
    }
    
    if (mimeType === 'application/pdf' || extension === '.pdf') {
      return 'PDF';
    }
    
    // Excel types
    if (mimeType.includes('spreadsheetml') || extension === '.xlsx' || extension === '.xls') {
      return 'EXCEL';
    }
    
    // Web content
    if (mimeType.includes('html') || extension === '.html' || extension === '.htm') {
      return 'WEBPAGE';
    }
    
    // Images
    if (mimeType.includes('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
      return 'IMAGE';
    }
    
    // Meeting minutes - could be in various formats, default to DOCUMENT if it seems like text
    if (mimeType.includes('text/') || extension === '.txt' || extension === '.md') {
      return 'MEETING_MINUTES';
    }
    
    // Default
    return 'OTHER';
  };

  export default detectFileType