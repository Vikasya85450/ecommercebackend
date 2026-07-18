import express from 'express'

import { orderplace, showOrder } from '../controllers/order.js';
import { isAdmin, isAuthenticated } from '../utils/index.js';

const router = express.Router();
router.post('/order',isAdmin,isAuthenticated, orderplace);
router.get("/order", isAuthenticated, showOrder);

export default router ;