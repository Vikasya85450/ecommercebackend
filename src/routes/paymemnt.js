import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RZP_KEY,
    key_secret: process.env.RZP_SECRET,
});

router.post('/create-order', async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt = 'order_receipt' } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Amount is required' });
        }

        const order = await razorpay.orders.create({
            amount: Number(amount) * 100,
            currency,
            receipt,
        });

        return res.status(200).json({
            success: true,
            order,
            key: process.env.RZP_KEY,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to create Razorpay order', error: error.message });
    }
});

router.post('/verify-payment', (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification data is missing' });
        }

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RZP_SECRET)
            .update(body)
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        return res.status(200).json({ success: isValid });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Unable to verify payment', error: error.message });
    }
});

export default router;