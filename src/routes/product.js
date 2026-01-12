import express from 'express'
import { uploadFile } from '../config/multer.js';
import { addProduct, deleteProduct, getProduct } from '../controllers/product.js';



const router = express.Router();

router.post("/product", uploadFile,addProduct);
router.get("/product/", getProduct);
router.post("/product-delete", deleteProduct);






export default router