import express from 'express'
import { addCategory, deleteCatogry, editCatogry, getAllCatogry } from '../controllers/category.js';
import { uploadFile } from '../config/multer.js';
import { isAdmin, isAuthenticated } from '../utils/index.js';



const router = express.Router();

router.post("/category", isAuthenticated, isAdmin,uploadFile,addCategory);
router.get("/category", getAllCatogry);
router.post("/category-delete", isAuthenticated, isAdmin,deleteCatogry);
router.post("/category-edit", isAuthenticated, isAdmin,uploadFile, editCatogry);



export default router