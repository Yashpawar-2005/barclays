import { Request, Response } from "express";
import prismaconnection from "../db/prisma";

export const create_organization=async(req:Request,res:Response)=>{
    try{
    const {name,termsheetname}=req.body;
    const userId = Number(req.userId);
    if (!name || !userId) {
        res.status(400).json({ message: "Organization name and userId are required." });
        return;
    }
    const organisation = await prismaconnection.organisation.create({
        data: {
            name,
            Termsheetname: termsheetname,
        },
    });
    await prismaconnection.userOrganisation.create({
        data: {
            userId: userId,
            organisationId: organisation.id,
            role: "admin",
        },
    });

    res.status(201).json({ message: "Organisation created", organisation });
} catch (error) {
    console.error("Error creating organisation:", error);
    res.status(500).json({ message: "Internal server error" });
}
}


export const get_organization=async (req:Request,res:Response) => {
    try {
        const userId=Number(req.userId)
        const userOrgs = await prismaconnection.user.findUnique({
            where: { id: userId },
            include: {
              organisations: {
                include: {
                  organisation: {
                    include: {
                      users: {
                        include: {
                          user: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          });
          if (!userOrgs) {
            res.status(404).json({ message: "User not found" });
            return;
          }
          const organisations = userOrgs.organisations.map((entry) => {
            const org = entry.organisation;
            const orgUsers = org.users.map((u) => ({
              id: u.user.id,
              name: u.user.name,
              email: u.user.email,
              role: u.role,
            }));
      
            return {
              id: org.id,
              name: org.name,
              termsheetname: org.Termsheetname,
              users: orgUsers,
            };
          });
      
          res.status(200).json({ organisations });
    } catch (error) {
        console.error("Error creating organisation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const add_user = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, role, organisationId } = req.body;

    // if (!email || !role || !organisationId) {
    //   res.status(400).json({ message: "Email, role, and organisationId are required" });
    //   return;
    // }
    let user = await prismaconnection.user.findUnique({
      where: { email },
    });
    if (!user) {
     res.json({message:"user dosesn't exist"})
     return;
    }
    const existingRelation = await prismaconnection.userOrganisation.findUnique({
      where: {
        userId_organisationId: {
          userId: user.id,
          organisationId,
        },
      },
    });

    if (existingRelation) {
      res.status(409).json({ message: "User is already part of the organisation" });
      return;
    }
    const userOrg = await prismaconnection.userOrganisation.create({
      data: {
        userId: user.id,
        organisationId,
        role,
      },
    });

    res.status(201).json({
      message: "User added to organisation",
      userId: user.id,
      organisationId,
      role,
    });
  } catch (error) {
    console.error("Error adding user to organisation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const get_members = async (req: Request, res: Response): Promise<void> => {
  try {
    const organisationId = Number(req.params.organisationId);

    // if (isNaN(organisationId)) {
    //   res.status(400).json({ message: "Invalid organisationId" });
    //   return;
    // }

    const organisation = await prismaconnection.organisation.findUnique({
      where: { id: organisationId },
      include: {
        users: {
          include: {
            user: true, 
          },
        },
      },
    });

    if (!organisation) {
      res.status(404).json({ message: "Organisation not found" });
      return;
    }

    const users = organisation.users.map((entry) => ({
      userId: entry.user.id,
      name: entry.user.name,
      email: entry.user.email,
      role: entry.role,
    }));

    res.status(200).json({ organisationId, users });
  } catch (error) {
    console.error("Error fetching organisation users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
