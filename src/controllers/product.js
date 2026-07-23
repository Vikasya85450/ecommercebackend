
import Category from "../models/category.js";
import Product from "../models/product.js";
import { getDataUrl } from "../utils/buffer.js";
import cloudinary from "cloudinary";
import { logActivity } from "../utils/activityLogger.js";
import { cacheGet, cacheSet, cacheDelPattern } from "../config/redis.js";



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

    await cacheDelPattern("products:*");
    await logActivity({
      actor: req.user,
      action: `added product "${result.title}"`,
      target: "product",
      targetId: result._id,
    });

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
    const cacheKey = `products:all:${id || "*"}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({
        status: true,
        result: cached
      })
    }

    let result;
     if(id){
      result = await Product.find({category: id}).populate("category");

     }else{
      result = await Product.find().populate("category");
     }

    await cacheSet(cacheKey, result, 300);

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

    // ✅ Find product
    const product = await Product.findById(req.params.id);

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
    await Product.findByIdAndDelete(req.params.id);

    await cacheDelPattern("products:*");
    await logActivity({
      actor: req.user,
      action: `deleted product "${product.title}"`,
      target: "product",
      targetId: product._id,
    });

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
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, brand, price, discount, stock } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Product id required" });
    }

    let updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (brand) updateData.brand = brand;
    if (price) updateData.price = price;
    if (discount) updateData.discount = discount;
    if (stock) updateData.stock = stock;

    if (req.file) {
      const fileBuffer = getDataUrl(req.file);
      const cloud = await cloudinary.v2.uploader.upload(
        fileBuffer.content,
        { folder: "products" }
      );

      updateData.image = cloud.secure_url;
      updateData.image_id = cloud.public_id;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await cacheDelPattern("products:*");
    await logActivity({
      actor: req.user,
      action: `edited product "${product.title}"`,
      target: "product",
      targetId: product._id,
    });

    res.status(200).json({
      success: true,
      message: "Product updated",
      data: product,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
     

export const showproduct = async (req, res) => {
  try {
    // ✅ 1. Get single product with category details
    const result = await Product.findById(req.params.id)
      .populate("category");

    if (!result) {
      return res.status(404).json({
        status: "error",
        message: "Product not found"
      });
    }

    // ✅ 2. Find related products (same category)
    const relatedProducts = await Product.find({
      category: result.category._id, // use category ID
      _id: { $ne: result._id }       // exclude current product
    })
      .populate("category")          // optional
      .limit(5);                     // optional limit

    // ✅ 3. Send response
    res.status(200).json({
      status: true,
       result,
      relatedProducts
    });

  } catch (error) {
    console.error("get product error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};

 export const searchproduct = async (req, res) => {
  try {

    
   var search =req.query.query;
    
    const product = await Product.find({
      title:{$regex: ".*" +search+ ".*",$options:"i"}
    });
     
    if (product.length<= 0) {
      return res.status(200).json({
        status: "success",
        message: "Product not found"
      })}

     res.status(200).json({
      status: true,
      message:"product found successfully",
      product
    })} catch (error) {

    console.error("get product error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
}