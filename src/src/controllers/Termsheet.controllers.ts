import { Request, Response } from 'express';
import prismaconnection from '../db/prisma';

export const getTermsheets = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all termsheets, including their file relations
    const termsheets = await prismaconnection.termsheet.findMany({
      include: {
        mapsheetFile: true,
        structuredsheetFile: true,
        ourtermsheetFile: true,
        validatedsheetFile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ termsheets });
  } catch (error) {
    console.error('Error fetching termsheets:', error);
    res.status(500).json({ error: 'Failed to fetch termsheets' });
  }
};
