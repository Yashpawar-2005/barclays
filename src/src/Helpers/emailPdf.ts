// src/Helpers/EmailPdf.ts
import PDFDocument from 'pdfkit';
import { ParsedMail } from 'mailparser';

export async function makeEmailPdf(
  mail: ParsedMail,
  data: Record<string,string>
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers: Buffer[] = [];

    doc.on('data', (b) => buffers.push(b));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Title
    doc.fontSize(18).text(`Order Confirmation: ${mail.subject}`, { underline: true });
    doc.moveDown();

    // Key/Value table
    doc.fontSize(12);
    for (const [k, v] of Object.entries(data)) {
      doc.text(`${k}: ${v}`);
    }
    doc.moveDown();

    // If there are attachments, list filenames
    if (mail.attachments && mail.attachments.length) {
      doc.fontSize(14).text('Attachments:', { underline: true });
      mail.attachments.forEach((att, i) => {
        doc.text(` ${i+1}. ${att.filename} (${att.contentType}, ${att.size} bytes)`);
      });
    }

    doc.end();
  });
}
