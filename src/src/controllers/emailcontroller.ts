// src/controllers/emailController.ts
import { Request, Response, NextFunction } from 'express';
import imaps from 'imap-simple';
import { simpleParser, ParsedMail, Attachment as ParsedAttachment } from 'mailparser';
import PDFDocument from 'pdfkit';
import { PDFDocument as PDFLibDocument } from 'pdf-lib';
import mammoth from 'mammoth';
import ExcelJS from 'exceljs';
import uploadBufferToS3 from "../Helpers/uploadtos3";

interface ImapConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}

async function fetchOrderEmail(config: ImapConfig, orderId: string): Promise<ParsedMail> {
  const connection = await imaps.connect({
    imap: { ...config, tlsOptions: { rejectUnauthorized: false } }
  });
  try {
    await connection.openBox('INBOX');
    const messages = await connection.search(
      [['HEADER', 'SUBJECT', orderId]],
      { bodies: [''] }
    );
    if (!messages.length) throw new Error(`No email found for order ID ${orderId}`);
    const raw = messages[messages.length - 1].parts[0].body as Buffer;
    return await simpleParser(raw);
  } finally {
    await connection.end();
  }
}

async function buildCombinedPdfBuffer(
  orderId: string,
  data: Record<string, string>,
  bodyText: string,
  attachments: ParsedAttachment[]
): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  doc.on('data', c => chunks.push(c));
  const finished = new Promise<Buffer>(resolve => doc.on('end', () => resolve(Buffer.concat(chunks))));

  // Title + key/value
  doc.fontSize(18).text(`Order ID: ${orderId}`, { underline: true }).moveDown();
  Object.entries(data).forEach(([k, v]) => {
    doc.fontSize(12).text(`${k}: ${v}`).moveDown(0.5);
  });

  // Email Body page
  if (bodyText.trim()) {
    doc.addPage();
    doc.fontSize(14).text('Email Body', { underline: true }).moveDown();
    doc.fontSize(12).text(bodyText, { width: 500 }).moveDown();
  }

  // Separate PDF attachments
  const pdfAtts: ParsedAttachment[] = [];

  for (const att of attachments) {
    if (att.contentType === 'application/pdf') {
      pdfAtts.push(att);
      continue;
    }

    doc.addPage().fontSize(14)
       .text(`Attachment: ${att.filename}`, { underline: true })
       .moveDown();

    // Images
    if (att.contentType.startsWith('image/')) {
      doc.image(att.content as Buffer, { fit: [450, 400], align: 'center', valign: 'center' });

    // Word → plain text
    } else if (
      att.contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const { value: html } = await mammoth.convertToHtml({ buffer: att.content as Buffer });
      const text = html.replace(/<[^>]+>/g, '');
      doc.fontSize(10).text(text, { width: 500 });

    // Enhanced Excel handling
    } else if (att.contentType.includes('spreadsheetml.sheet')) {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(att.content as Buffer);

      wb.eachSheet((sheet, sheetId) => {
        // only add page *before* sheet 2+
        if (sheetId > 1) doc.addPage();

        doc.fontSize(12).text(`Sheet: ${sheet.name}`, { underline: true }).moveDown(0.3);

        sheet.eachRow((row) => {
          // page-break if we're running out of room
          const bottomMargin = doc.page.height - doc.page.margins.bottom;
          if (doc.y > bottomMargin - 40) {
            doc.addPage();
          }

          // skip the first element (ExcelJS uses it for row number)
          const cells = Array.isArray(row.values) ? row.values.slice(1) : Object.values(row.values);
          const rowText = cells.map(c => (c != null ? String(c) : '')).join(' | ');
          doc.fontSize(10).text(rowText, { width: 500 }).moveDown(0.2);
        });
      });

    // Plain‑text fallback
    } else {
      const txt = (att.content as Buffer).toString('utf-8');
      doc.fontSize(10).text(txt, { width: 500 });
    }
  }

  // finish PDFKit
  doc.end();
  const basePdf = await finished;

  // merge PDF attachments via pdf-lib
  if (!pdfAtts.length) return basePdf;
  const mainPdf = await PDFLibDocument.load(basePdf);
  for (const att of pdfAtts) {
    const part = await PDFLibDocument.load(att.content as Buffer);
    const pages = await mainPdf.copyPages(part, part.getPageIndices());
    pages.forEach(p => mainPdf.addPage(p));
  }
  const merged = await mainPdf.save();
  return Buffer.from(merged);
}

export async function fetchOrderEmailHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password, host, port, tls = true, orderId } = req.body as any;
  try {
    const mail = await fetchOrderEmail(
      { user: email, password, host, port, tls },
      orderId
    );

    // parse key/value pairs
    const data: Record<string, string> = {};
    if (mail.text) {
      mail.text
        .split(/\r?\n/)
        .filter(line => line.includes(':'))
        .forEach(line => {
          const [k, ...rest] = line.split(':');
          data[k.trim()] = rest.join(':').trim();
        });
    }

    const bodyText = mail.text || '';
    const attachments = mail.attachments as ParsedAttachment[];
    const pdfBuffer = await buildCombinedPdfBuffer(
      orderId,
      data,
      bodyText,
      attachments
    );

    const s3Key = `pdf/${orderId}-${Date.now()}.pdf`;
const { Location } = await uploadBufferToS3({
  buffer: pdfBuffer,
  key: s3Key,
  contentType: 'application/pdf'
});


    res.json({ pdfUrl: Location });
  } catch (err) {
    console.error('EmailController error:', err);
    next(err);
  }
}
