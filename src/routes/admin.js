import express from 'express';
import { isAuthenticated, isAdmin } from '../utils/index.js';
import {
  statsSummary,
  statsSales,
  listUsers,
  getUserDetail,
  updateUser,
  listOrdersAdmin,
  updateOrderStatus,
  getActivityLog,
  lowStockProducts,
} from '../controllers/admin.js';

const router = express.Router();

router.use(isAuthenticated, isAdmin);

router.get('/stats/summary', statsSummary);
router.get('/stats/sales', statsSales);

router.get('/users', listUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id', updateUser);

router.get('/orders', listOrdersAdmin);
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/activity-log', getActivityLog);

router.get('/products/low-stock', lowStockProducts);

export default router;
