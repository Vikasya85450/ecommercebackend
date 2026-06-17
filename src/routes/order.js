import express from 'express'

import { orderplace, showOrder } from '../controllers/order.js';

const router = express.Router();
router.post('/order', orderplace);
router.get('/order' ,showOrder)

export default router ;