import mongoose from "mongoose"


const productSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,

    },
    price: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    image_id: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        index: true
    }

})
const Product = mongoose.model("Product", productSchema);

export default Product