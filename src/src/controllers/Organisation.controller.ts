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
      console.log("get-org")
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






export const getAllUsers = async (req: Request, res: Response) => {
  if (!req.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const users = await prismaconnection.user.findMany({
      where: {
        id: {
          not: parseInt(req.userId),
        }
      },
      select: {
        id: true,
        name: true,
      }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};





export const createOrganization = async (req: Request, res: Response) => {
  const { name, members } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Organization name is required' });
    return }
  if (!req.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return 
  }

  try {
    const newOrg = await prismaconnection.organisation.create({
      data: {
        name,
        id: parseInt(req.userId), 
      }
    });

    if (members && Array.isArray(members)) {
      await prismaconnection.userOrganisation.createMany({
        data: members.map(m => ({
          userId: parseInt(m.id),
          organisationId: newOrg.id,
          role: m.role || 'Member'
        }))
      });
    }

    res.status(201).json({ id: String(newOrg.id), name: newOrg.name });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};





export const createOrganizationWithUsers = async (req: Request, res: Response) => {
  console.log(req.body)
  const { orgName, users } = req.body; // Expecting { orgName: string, users: [{ id, name, role }] }
  if(!req.userId){
    res.status(401).json({error:"not authenticated"})
    return
  }
  const currentUserId = parseInt(req.userId);  // Middleware provides req.userId
  if (!orgName || !users || users.length === 0) {
    res.status(400).json({ error: 'Organization name and users are required' });
    return 
  }

  try {
    // Step 1: Create the organization
    const newOrganization = await prismaconnection.organisation.create({
      data: {
        name: orgName,
      },
    });

    // Step 2: Prepare to add the requesting user as an admin
    const userOrganisations = [
      {
        userId: currentUserId,    
        organisationId: newOrganization.id,
        role: 'admin',            
      },
    ];

    // Step 3: Create or Link other users to the organization
    for (const user of users) {
      const existingUser = await prismaconnection.user.findUnique({
        where: { id: user.id },
      });

      let userId = user.id;

      if (!existingUser) {
        // Create a new user if not existing
        const newUser = await prismaconnection.user.create({
          data: {
            name: user.name,
            email: user.email, // Ensure email is unique if provided
            password: 'defaultPassword' // Handle password securely
          },
        });
        userId = newUser.id;
      }

      userOrganisations.push({
        userId: userId,
        organisationId: newOrganization.id,
        role: user.role,
      });
    }
    

    // Step 4: Add users (including the admin) to the organization
    await prismaconnection.userOrganisation.createMany({
      data: userOrganisations,
    });

    // Return the created organization with the associated users
    const createdOrganization = await prismaconnection.organisation.findUnique({
      where: { id: newOrganization.id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(createdOrganization); // Return the created org with users
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

