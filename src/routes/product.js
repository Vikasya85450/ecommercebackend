import express from 'express'
import { uploadFile } from '../config/multer.js';
import { addProduct, getProduct } from '../controllers/product.js';



const router = express.Router();

router.post("/product", uploadFile,addProduct);
router.get("/product/", getProduct);







export default router