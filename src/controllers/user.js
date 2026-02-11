
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { hashPassword, isMatched, tokenGenerator } from "../utils/index.js";


export const SignUp = async(req,res)=>{
try {
    const {name,email,password}=req.body;
    
    
    if(!email|| !name ||!password){
        res.status(400).json({
            status:'error',
            message:"All field required"
        });
    };

    const userExist = await User.findOne({ email });

    if(userExist){
        res.status(400).json({
            status:'error',
            message:"duplicate not allowed"
        }); 
    };

const hp = await hashPassword(password);

const user= new User ({
    name,
    email,
    password:hp
});
const result = await user.save();
const payload={
    id:result._id,
    email:result.email
};
const token =tokenGenerator(payload)

res.status(201).json({
    status:"Success",
    meassage :"user created succesfully ",
    token,
    user:{
email:result.email,
    id:result._id,
    role:result.role
    }
    


})

} catch (error) {
    console.log("signup error :",error);
     res.status(500).json({
            status:'error',
            message:"server error"
        }); 
    }    
}

export const SignIn =async(req,res)=>{
    try {
        const { email,password}=req.body;
        
        
        if(!email || !password){
            res.status(400).json({
            status:'error',
            message:"All field required"
        });
                };


        const userExist = await User.findOne({email});
        if(!userExist){
            return res.status(200).json({
                message:"user not found"
            })
        };

        const iM = await isMatched(password,userExist.password)
         if(iM===false){
             return res.status(401).json({
                status:"success",
                message:"password invalid"
            })
         }

         const payload={
    id:userExist._id,
    email:userExist.email
};
const token =tokenGenerator(payload);


res.status(200).json({
    status:"Success",
    meassage :"user login succesfully ",
    token,
  user:{
     id:userExist._id,
    email:userExist.email,
    role:userExist.role
  }
})
    } 
       catch (error) {
    console.log("signin error :",error);
     res.status(500).json({
            status:'error',
            message:"server error"
        }); 
    }    
 
    }
    
export const usedetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User found successfully",
      user,
    });
  } catch (error) {
    console.log("user details error:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};
