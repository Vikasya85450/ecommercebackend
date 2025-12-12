import mongoose from "mongoose";


const dbConnect=async()=>{
    try {
        
        
        const res = await mongoose.connect(process.env.MONGO_URL);
    if(res){
        console.log("Database Connected");
        
    }
    } catch (error) {
        console.log("Error occured in connecting db",error);
        
        
    }
}

export default dbConnect;