import express from 'express'
import morgan from 'morgan';
import UserRouter from './routes/user.js'
import dbConnect from './config/db.js';
import cors from 'cors'
import categoryRouter from './routes/category.js'
import productRouter from './routes/product.js'
import addressRoute from './routes/address.js'
import orderRouter from './routes/order.js'
import reviewRouter from './routes/review.js'
import giftRouter from './routes/Giftcard.js'
import paymentRouter from './routes/paymemnt.js'
import adminRouter from './routes/admin.js'
import cloudinary from 'cloudinary'
import './config/redis.js'


import dotenv from "dotenv";
dotenv.config();

const app=express();

const Port=process.env.PORT || 8080;

// middlewares
dbConnect();
cloudinary.v2.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan('dev'))

// all routes

app.use('/api/user',UserRouter);
app.use('/api',categoryRouter);
app.use('/api',productRouter);
app.use('/api',addressRoute);
app.use('/api',orderRouter);
app.use('/api',reviewRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/admin', adminRouter);
app.use('/',giftRouter);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ecommerce API is running 🚀",
  });
});

app.get("/health",(req,res)=>{
    res.json({
        message:"Server is Healthy"
    })
})

app.listen(Port,()=>{
    console.log(`Server started at : http://localhost:${Port}`);
    
})