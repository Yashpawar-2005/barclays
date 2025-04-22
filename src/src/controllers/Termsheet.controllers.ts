// barclays/app/src/src/controllers/Termsheet.controllers.ts
import { Request, Response } from 'express'
import prismaconnection from '../db/prisma'

export const getTermsheets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { organisationId } = req.query
    const where: Record<string, unknown> = {}

    if (organisationId) {
      const orgIdNum = parseInt(organisationId as string, 10)
      if (isNaN(orgIdNum)) {
        res.status(400).json({ error: 'organisationId must be a number' })
        return
      }
      where.organisationId = orgIdNum
    }

    const termsheets = await prismaconnection.termsheet.findMany({
      where,
      include: {
        mapsheetFile:        true,
        structuredsheetFile:  true,
        ourtermsheetFile:     true,
        validatedsheetFile:   true,
        // coloursheetFile:      true,
        organisation: {
          include: {
            users: {
              include: { user: true }
            }
          }
        },
        discrepancies: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.status(200).json({ termsheets })
  } catch (error) {
    console.error('Error fetching termsheets:', error)
    res.status(500).json({ error: 'Failed to fetch termsheets' })
  }
}
