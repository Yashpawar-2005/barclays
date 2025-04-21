import { Router } from 'express';
import { authenticate } from '../middlewares/Authcheck';  // if you require auth
import { getTermsheets } from '../controllers/Termsheet.controllers';

const termsheetRouter = Router();

// GET  /api/v1/termsheet
termsheetRouter.get('/', authenticate, getTermsheets);

export default termsheetRouter;
