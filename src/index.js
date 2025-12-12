import express from 'express'
import morgan from 'morgan';
import UserRouter from './routes/user.js'
import dbConnect from './config/db.js';

const app=express();

const Port=process.env.PORT || 4000;

// middlewares
dbConnect();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan('dev'))

// all routes

app.use('/api/user',UserRouter);

app.get("/health",(req,res)=>{
    res.json({
        message:"Server is Healthy"
    })
})

app.listen(Port,()=>{
    console.log(`Server started at : http://localhost:${Port}`);
    
})