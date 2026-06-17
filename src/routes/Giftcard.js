import express from 'express'

import { createGiftCard, getGiftCard } from '../controllers/giftcard.js';
import { sendGiftEmail } from '../utils/mail.js';

const router = express.Router();
router.post('/giftcard', createGiftCard);
router.get('/giftcard', getGiftCard);


router.post('/send-gift-email', sendGiftEmail);

export default router ;