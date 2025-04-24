import { Router } from 'express'
import { authenticate } from '../middlewares/Authcheck'
import {
  getTermsheets,
  getTermsheetById,
} from '../controllers/Termsheet.controllers'

const router = Router()

// GET /api/v1/termsheet?organisationId=123
router.get('/', authenticate, getTermsheets)

// GET /api/v1/termsheet/:id
router.get('/:id', authenticate, getTermsheetById)

export default router
