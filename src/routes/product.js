import express from 'express'
import { uploadFile } from '../config/multer.js';
import { addProduct, deleteProduct, getProduct, searchproduct, showproduct, updateProduct } from '../controllers/product.js';



const router = express.Router();

router.post("/product", uploadFile,addProduct);
router.get("/product/", getProduct);
router.delete("/product-delete/:id", deleteProduct);
router.put("/product/:id",uploadFile,updateProduct);
router.get("/product/search", searchproduct);
router.get("/product/:id", showproduct);






export default router