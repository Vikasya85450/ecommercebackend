import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'



export const hashPassword =async(password)=>{
const hp = await bcrypt.hash(password,10)
return hp;
}

export const tokenGenerator = (payload)=>{
const token = jwt.sign(payload ,process.env.JWT_SECRET,{
    expiresIn:"15d",
});
return token; 
}

export const isMatched = async(password,dbpassword)=>{
const result = await bcrypt.compare(password,dbpassword)
return result;
}
