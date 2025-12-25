
import mongoose from "mongoose";

export const categorySchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    image:{
        type:String,
         default:"https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    image_id:String


},{
    timestamps:true
})

const Category= mongoose.model("Category",categorySchema);
export default Category;