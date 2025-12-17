import express from 'express'
import { addCategory } from '../controllers/category.js';
import uploadFile from '../config/multer.js';



const router = express.Router();

router.post("/category",uploadFile,addCategory)


export default router