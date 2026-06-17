import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



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



export const isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid",
    });
  }
};