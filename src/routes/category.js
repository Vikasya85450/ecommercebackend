import express from 'express'
import { addCategory, deleteCatogry, editCatogry, getAllCatogry } from '../controllers/category.js';
import { uploadFile } from '../config/multer.js';



const router = express.Router();

router.post("/category", uploadFile, addCategory);
router.get("/category", getAllCatogry);
router.post("/category-delete", deleteCatogry);
router.post("/category-edit", uploadFile, editCatogry);



export default router