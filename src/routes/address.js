import express from 'express'
import { addAddress, getaddress } from '../controllers/address.js';
import { isAuthenticated } from '../utils/index.js';





const router = express.Router();

router.post("/address", isAuthenticated, addAddress);
router.get("/address", isAuthenticated, getaddress);

export default router;