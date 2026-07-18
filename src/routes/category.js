import express from 'express'
import { addCategory, deleteCatogry, editCatogry, getAllCatogry } from '../controllers/category.js';
import { uploadFile } from '../config/multer.js';
import { isAdmin } from '../utils/index.js';



const router = express.Router();

router.post("/category", isAdmin,uploadFile,addCategory);
router.get("/category", getAllCatogry);
router.post("/category-delete", isAdmin,deleteCatogry);
router.post("/category-edit", isAdmin,uploadFile, editCatogry);



export default router