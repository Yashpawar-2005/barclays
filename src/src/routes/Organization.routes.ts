import { Router } from "express";
import { authenticate } from "../middlewares/Authcheck";
import { add_user, create_organization, createOrganization, createOrganizationWithUsers, get_organization,  getAllUsers } from "../controllers/Organisation.controller";
import { get_members } from "../controllers/Organisation.controller";
const Organisztionrouter=Router();

Organisztionrouter.post("/create_organization",authenticate,create_organization);
Organisztionrouter.get("/get_organization",authenticate,get_organization);
Organisztionrouter.post("/add_member",authenticate,add_user)
Organisztionrouter.get("/get_members/:organisationId",get_members)
Organisztionrouter.get("/ge_org",authenticate,getAllUsers)
Organisztionrouter.post("/createorg",authenticate,createOrganization)
Organisztionrouter.post("/Org_creation_with_user",authenticate,createOrganizationWithUsers)

export default Organisztionrouter;