import express, { Router, Request, Response, NextFunction } from 'express';
import { fetchOrderEmailHandler } from '../controllers/emailcontroller';

const router: Router = express.Router();

// Health check
router.get(
  '/health',
  (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ status: 'OK', service: 'EmailFetcher' });
    next();
  }
);

// Fetch and bundle order email
router.post(
  '/fetch-order-email',
  fetchOrderEmailHandler
);

// Error handler (must have 4 args)
router.use(
  (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('EmailRoutes error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  }
);

export default router;
