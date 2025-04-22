// barclays/src/src/routes/Termsheet.route.ts
import { Router } from 'express'
import { authenticate } from '../middlewares/Authcheck'
import { getTermsheets } from '../controllers/Termsheet.controllers'

const router = Router()

// GET /api/v1/termsheet?organisationId=123
router.get('/', authenticate, getTermsheets)

export default router
