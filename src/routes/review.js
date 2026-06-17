import express from 'express'
import { getreview, postreview } from '../controllers/review.js';

const router = express.Router();

router.post('/review',postreview)
router.get('/review',getreview)



export default router ;