import {Router} from 'express'
import accept_multiple_discrepancies from '../controllers/Discripancy.controller';
import { authenticate } from '../middlewares/Authcheck';
const Discrepancieroute=Router();

Discrepancieroute.post("/termsheet/:organisationid/discrepancies/:id/accept",authenticate,accept_multiple_discrepancies)
export default Discrepancieroute