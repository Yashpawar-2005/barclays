import { Request, Response } from 'express';
import prismaconnection from '../db/prisma';

const accept_multiple_discrepancies = async (req: Request, res: Response) => {
  try {
    const { organisationid, id } = req.params;
    const userId = req.userId;
    
    if(!userId) {
      res.status(401).json({message: "Unauthorized"})
      return
    }
    
    // console.log(req.body)
    
    // Parse the single discrepancy ID
    const discrepancyId = parseInt(id);
    
    if (isNaN(discrepancyId)) {
      res.status(400).json({ 
        success: false, 
        message: 'A valid discrepancy ID is required' 
      });
      return 
    }
    
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
    
    // If admin, update the discrepancy to set acceptedbyadmin = true
    if (isAdmin) {
      const updatedDiscrepancy = await prismaconnection.discrepancy.update({
        where: {
          id: discrepancyId
        },
        data: {
          //@ts-ignore
          acceptedbyadmin: true
        }
      });

      res.status(200).json({
        success: true,
        message: `Discrepancy ${discrepancyId} accepted by admin`,
        updatedDiscrepancy
      });
      return
    } else {
      // For non-admin users, check if the discrepancy matches their role
      const discrepancy = await prismaconnection.discrepancy.findFirst({
        where: {
          id: discrepancyId,
          role: userOrganization.role
        }
      });
      
      if (!discrepancy) {
        res.status(403).json({
          success: false,
          message: `Unauthorized to accept this discrepancy or discrepancy not found`
        });
        return
      }
      
      // Update the discrepancy for the user's role
      const updatedDiscrepancy = await prismaconnection.discrepancy.update({
        where: {
          id: discrepancyId
        },
        data: {
          //@ts-ignore
          acceptedbyrole: true
        }
      });
      console.log("last tak ga")
      res.status(200).json({
        success: true,
        message: `Discrepancy ${discrepancyId} accepted for role ${userOrganization.role}`,
        updatedDiscrepancy
      });
      return 
    }
    
  } catch (error:any) {
    console.error('Error accepting discrepancy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept discrepancy',
      error: error.message
    });
    return 
  }
};

export default accept_multiple_discrepancies;