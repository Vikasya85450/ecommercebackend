import Category from "../models/category.js";
import { getDataUrl } from "../utils/buffer.js";
import cloudinary from "cloudinary";


export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const file = req.file;

    if (!name || !file) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required"
      });
    }

    const fileBuffer = getDataUrl(file);

    const cloud = await cloudinary.v2.uploader.upload(
      fileBuffer.content,
      {
        folder: "categories"
      }
    );

    const x = new Category({
      name: name,
      image: cloud.secure_url,
      image_id: cloud.public_id
    })
    const result = await x.save();
    console.log(result);


    res.status(200).json({
      status: "success",
      message: "Category added successfully",
      result
    });

  } catch (error) {
    console.error("add category error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
};
export const getAllCatogry = async (req, res) => {
  try {
    const result = await Category.find();

    res.status(200).json({
      status: "success",
      message: "All Category",
      result
    });

  } catch (error) {
    console.error("get category error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
}

export const deleteCatogry = async (req, res) => {
  try {
    console.log(req.body);

    const { id } = req.body;


    if (!id) {
      return res.status(400).json({
        status: "Error",
        message: "ID required"
      })
    }

    const category = await Category.findById(id);
    const imageDeleted = await cloudinary.uploader.destroy(category?.image_id);
    if (imageDeleted) {
      const result = await Category.findByIdAndDelete(id);
      console.log(result);
    }


    res.status(200).json({
      status: "success",
      message: "Category delete successfully",
      category
    });

  } catch (error) {
    console.error("get category  error", error);
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
}

export const editCatogry = async (req, res) => {
  try {
    const { name, id } = req.body;

    if (!name) {
      return res.status(400).json({
        success: "false",
        message: "name is required"
      })
    }
    const file = req.file;




    if (file) {
      const item = await Category.findById(id);
      const imageDeleted = await cloudinary.uploader.destroy(item?.image_id);
      const fileBuffer = getDataUrl(file);
      const cloud = await cloudinary.v2.uploader.upload(
        fileBuffer.content,
        {
          folder: "categories"
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

