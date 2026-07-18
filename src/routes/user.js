import express from 'express';
import {
    SignUp,
    SignIn,
    getMe,
    usedetails,
    forgotPassword,
    verifyOtp,
    resetPassword,
} from '../controllers/user.js';
import { isAuthenticated } from '../utils/index.js';

const router = express.Router();

router.post('/sign-up', SignUp);
router.post('/sign-in', SignIn);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', isAuthenticated, getMe);
router.get('/:id', isAuthenticated, usedetails);

export default router;