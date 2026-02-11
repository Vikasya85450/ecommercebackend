import express from 'express'
import { SignUp,SignIn, usedetails } from '../controllers/user.js';


const router = express.Router();

router.post("/sign-up",SignUp)
router.post("/sign-in",SignIn)
router.get("/:id",usedetails)

export default router