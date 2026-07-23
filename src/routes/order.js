import express from 'express'

import { orderplace, showOrder, cancelOrder } from '../controllers/order.js';
import { isAuthenticated } from '../utils/index.js';

const router = express.Router();
router.post('/order', isAuthenticated, orderplace);
router.get('/order', isAuthenticated, showOrder);
router.patch('/order/:id/cancel', isAuthenticated, cancelOrder);

export default router;