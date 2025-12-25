
import Product from "../models/product.js";
import { getDataUrl } from "../utils/buffer.js";
import cloudinary from "cloudinary";



export const addProduct = async (req, res) => {
  try {
    const { title, description, brand, stock, category, price, discount } = req.body;
    const image = req.file;

    if (!title || !description || !brand || !stock || !category || !price || !discount || !image) {
      return res.status(400).json({
        success: false,
        message: "All field required !"
      })
    }

    const fileBuffer = getDataUrl(image);

    const cloud = await cloudinary.v2.uploader.upload(
      fileBuffer.content,
      {
        folder: "products"
      }
    );

    const result = await Product.create({
      title,
      description,
      brand,
      price,
      discount,
      stock,
      category,
      image: cloud.secure_url,
      image_id: cloud.public_id,



    })

    return res.status(201).json({
      status: true,
      message: "Product Created !!!",
      result
    })


  } catch (error) {

    console.error("add product error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
}
export const getProduct = async (req, res) => {
  try {

    const { id } = req.query;

    let result;
     if(id){
      result = await Product.find({category: id}).populate("category");

     }else{
      result = await Product.find().populate("category");
     }



    
    return res.status(200).json({
      status: true,
      result
    })


  } catch (error) {

    console.error("get product error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
}
// export const getProduct = async (req, res) => {
//   try {



//     const result = await Product.find().populate("category");
//     return res.status(200).json({
//       status: true,
//       result
//     })


//   } catch (error) {

//     console.error("get product error:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Server error"
//     });
//   }
// }


// export const getProductByCategory = async (req, res) => {
//   try {

//     const {id}=req.body;

//    const result = await Product.find({
//   category: id
// }).populate("category");


//   } catch (error) {

//     console.error("get product error:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Server error"
//     });
//   }
// }
