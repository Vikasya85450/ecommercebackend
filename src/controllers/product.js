
import Category from "../models/category.js";
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
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body; // ✅ use id OR _id (be consistent)

    if (!id) {
      return res.status(400).json({
        status: "error",
        message: "Product ID is required"
      });
    }

    // ✅ Find product
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found"
      });
    }

    // ✅ Delete image from Cloudinary
    if (product.image_id) {
      await cloudinary.v2.uploader.destroy(product.image_id);

    }

    // ✅ Delete product from DB
    await Product.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
      product
    });

  } catch (error) {
    console.error("delete product error:", error);
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};


export const editProduoct = async (req, res) => {
  try {
    const { title, id } = req.body;

    if (!title) {
      return res.status(400).json({
        success: "false",
        message: "title is required"
      })
    }
    const file = req.file;
    if (file) {
      const product = await Category.findById(id);
      const imageDeleted = await cloudinary.uploader.destroy(product?.image_id);
      const fileBuffer = getDataUrl(file);
      const cloud = await cloudinary.v2.uploader.upload(
        fileBuffer.content,
        {
          folder: "products"
        }
      );

      if (cloud) {
        const result = await Category.findByIdAndUpdate(id, {
          name,
          image: cloud.secure_url,
          image_id: cloud.public_id

        })
      }

      return res.status(202).json({
        status: "Success",
        message: "Edit Successfully"
      });

    } else {
      const result = await Category.findByIdAndUpdate(id, {
        name
      })

      res.status(202).json({
        status: "Success",
        message: "Edit Successfully",
        result
      });

    }
  } catch (error) {
    console.error("edit category error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
}

