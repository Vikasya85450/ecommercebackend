import express from 'express'
import morgan from 'morgan';
import UserRouter from './routes/user.js'
import dbConnect from './config/db.js';
import cors from 'cors'
import categoryRouter from './routes/category.js'
import cloudinary from 'cloudinary'

const app=express();

const Port=process.env.PORT || 4000;

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
app.use('/api',categoryRouter)

app.get("/health",(req,res)=>{
    res.json({
        message:"Server is Healthy"
    })
})

app.listen(Port,()=>{
    console.log(`Server started at : http://localhost:${Port}`);
    
})