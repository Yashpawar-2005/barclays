import { Request, Response } from 'express';
import prismaconnection from '../db/prisma';
const accept_multiple_discrepancies = async (req: Request, res: Response) => {
  try {
    const { organisationid } = req.params;
    const userId = req.userId; 
    if(!userId){
        res.status(401).json({message:"Unautherized"})
        return
      }
    const { discrepancyIds } = req.body; 
    if (!Array.isArray(discrepancyIds) || discrepancyIds.length === 0) {
        res.status(400).json({ 
            success: false, 
            message: 'An array of discrepancy IDs is required' 
        });
        return 
    }
    const parsedIds = discrepancyIds.map(id => parseInt(id));
    
    // Get the user's role for this organization
    const userOrganization = await prismaconnection.userOrganisation.findUnique({
      where: {
        userId_organisationId: {
          userId: parseInt(userId),
          organisationId: parseInt(organisationid)
        }
      },
      select: {
        role: true
      }
    });

    if (!userOrganization) {
        res.status(403).json({ 
            success: false, 
            message: 'User does not belong to this organization' 
        });
        return 
    }

    // Check if user is admin
    const isAdmin = userOrganization.role.toLowerCase() === 'admin';
    
    // If admin, verify all discrepancies exist and belong to the org
    if (isAdmin) {
      // Update all discrepancies to set acceptedbyadmin = true
      const updatedCount = await prismaconnection.discrepancy.updateMany({
        where: {
          id: { in: parsedIds }
        },
        data: {
            //@ts-ignore
          acceptedbyadmin: true
        }
      });

      res.status(200).json({
          success: true,
          message: `${updatedCount.count} discrepancies accepted by admin`,
          count: updatedCount.count
        });
        return
    } else {
      // For non-admin users, only update discrepancies matching their role
      const updatedCount = await prismaconnection.discrepancy.updateMany({
        where: {
          id: { in: parsedIds },
          role: userOrganization.role
        },
        data: {
            //@ts-ignore
          acceptedbyrole: true
        }
      });

      res.status(200).json({
          success: true,
          message: `${updatedCount.count} discrepancies accepted for role ${userOrganization.role}`,
          count: updatedCount.count
        });
        return 
    }
    
  } catch (error:any) {
    console.error('Error accepting discrepancies:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to accept discrepancies',
        error: error.message
    });
    return 
  }
};

export default accept_multiple_discrepancies;