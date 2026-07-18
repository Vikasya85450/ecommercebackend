import express from 'express'
import { getreview, postreview, updateReview, deleteReview } from '../controllers/review.js';
import { isAuthenticated } from '../utils/index.js';

const router = express.Router();

router.post('/review', isAuthenticated, postreview)
router.get('/review', getreview)
router.patch('/review/:id', isAuthenticated, updateReview)
router.delete('/review/:id', isAuthenticated, deleteReview)

export default router;