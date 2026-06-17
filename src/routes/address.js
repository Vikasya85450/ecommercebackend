import express from 'express'
import { addAddress, getaddress } from '../controllers/address.js';





const router = express.Router();

router.post("/address",addAddress);
router.get("/address",getaddress);

export default router;