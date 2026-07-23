import express from 'express'
import { uploadFile } from '../config/multer.js';
import { addProduct, deleteProduct, getProduct, searchproduct, showproduct, updateProduct } from '../controllers/product.js';
import { isAdmin, isAuthenticated } from '../utils/index.js';



const router = express.Router();

router.post("/product",isAuthenticated, isAdmin,uploadFile,addProduct);
router.get("/product/", getProduct);
router.delete("/product-delete/:id", isAuthenticated, isAdmin,deleteProduct);
router.put("/product/:id",isAuthenticated, isAdmin,uploadFile,updateProduct);
router.get("/product/search", searchproduct);
router.get("/product/:id", showproduct);






export default router