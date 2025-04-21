import { Request, Response } from "express";
import prismaconnection from "../db/prisma";

export const create_organization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, termsheetname } = req.body;
    const userId = Number(req.userId);
    if (!name || !userId) {
      res.status(400).json({ message: "Organization name and userId are required." });
      return;
    }
    const organisation = await prismaconnection.organisation.create({
      data: { name, Termsheetname: termsheetname },
    });
    await prismaconnection.userOrganisation.create({
      data: { userId, organisationId: organisation.id, role: "admin" },
    });
    res.status(201).json({ message: "Organisation created", organisation });
  } catch (error) {
    console.error("Error creating organisation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const get_organization = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.userId);
    const userOrgs = await prismaconnection.user.findUnique({
      where: { id: userId },
      include: { organisations: { include: { organisation: { include: { users: { include: { user: true } } } } } } },
    });
    if (!userOrgs) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const organisations = userOrgs.organisations.map((entry) => {
      const org = entry.organisation;
      const orgUsers = org.users.map((u) => ({ id: u.user.id, name: u.user.name, email: u.user.email, role: u.role }));
      return { id: org.id, name: org.name, termsheetname: org.Termsheetname, users: orgUsers };
    });
    res.status(200).json({ organisations });
  } catch (error) {
    console.error("Error fetching organisations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const add_user = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, role, organisationId } = req.body;
    let user = await prismaconnection.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User doesn't exist" });
      return;
    }
    const existingRelation = await prismaconnection.userOrganisation.findUnique({
      where: { userId_organisationId: { userId: user.id, organisationId } },
    });
    if (existingRelation) {
      res.status(409).json({ message: "User is already part of the organisation" });
      return;
    }
    await prismaconnection.userOrganisation.create({ data: { userId: user.id, organisationId, role } });
    res.status(201).json({ message: "User added to organisation", userId: user.id, organisationId, role });
  } catch (error) {
    console.error("Error adding user to organisation:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const get_members = async (req: Request, res: Response): Promise<void> => {
  try {
    const organisationId = Number(req.params.organisationId);
    const organisation = await prismaconnection.organisation.findUnique({
      where: { id: organisationId }, include: { users: { include: { user: true } } },
    });
    if (!organisation) {
      res.status(404).json({ message: "Organisation not found" });
      return;
    }
    const users = organisation.users.map((entry) => ({
      userId: entry.user.id, name: entry.user.name, email: entry.user.email, role: entry.role,
    }));
    res.status(200).json({ organisationId, users });
  } catch (error) {
    console.error("Error fetching organisation users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const users = await prismaconnection.user.findMany({
      where: { id: { not: parseInt(req.userId) } }, select: { id: true, name: true },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Create organization with users (new org or from template)
export const createOrganization = async (req: Request, res: Response): Promise<void> => {
  const { name, members } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Organization name is required' });
    return;
  }
  if (!req.userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const newOrg = await prismaconnection.organisation.create({ data: { name } });
    if (Array.isArray(members) && members.length) {
      await prismaconnection.userOrganisation.createMany({
        data: members.map(m => ({ userId: parseInt(m.id), organisationId: newOrg.id, role: m.role || 'Member' })),
        skipDuplicates: true,
      });
    }
    res.status(201).json({ id: String(newOrg.id), name: newOrg.name });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

export const createOrganizationWithUsers = async (req: Request, res: Response): Promise<void> => {
  const { orgName, users, templateOrgId } = req.body;
  if (!req.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (!orgName) {
    res.status(400).json({ error: "Organization name is required" });
    return;
  }
  try {
    let template = null;
    if (templateOrgId) {
      template = await prismaconnection.organisation.findUnique({
        where: { id: Number(templateOrgId) },
        select: { Termsheetname: true, users: { select: { userId: true, role: true } } },
      });
      if (!template) {
        res.status(404).json({ error: "Template organization not found" });
        return;
      }
    }
    const newOrg = await prismaconnection.organisation.create({
      data: { name: orgName, Termsheetname: template?.Termsheetname ?? undefined },
    });
    const linkData: Array<{ userId: number; organisationId: number; role: string }> = [];
    linkData.push({ userId: parseInt(req.userId), organisationId: newOrg.id, role: 'admin' });
    if (template) {
      template.users.forEach(m => linkData.push({ userId: m.userId, organisationId: newOrg.id, role: m.role }));
    } else if (Array.isArray(users) && users.length) {
      users.forEach(u => linkData.push({ userId: u.id, organisationId: newOrg.id, role: u.role || 'Member' }));
    }
    await prismaconnection.userOrganisation.createMany({ data: linkData, skipDuplicates: true });
    const created = await prismaconnection.organisation.findUnique({
      where: { id: newOrg.id }, include: { users: { include: { user: { select: { id: true, name: true } } } } } },
    );
    res.status(201).json(created);
  } catch (err) {
    console.error("Error in createOrganizationWithUsers:", err);
    res.status(500).json({ error: "Failed to create organization" });
  }
};
