import { Request,Response } from "express"
import becrypt from 'bcryptjs'
import User from "../models/User";
import { genarateToken } from "../utils/token";
export const registerUser = async(req:Request,res:Response):Promise<void> =>{
  const {email,password,name,avatar} = req.body;
  console.log(req.body,'THIS IS EGISTER USER');
  
  try {
    let user = await User.findOne({email})
    if(user){
        res.status(400).json({success:false,msg:"User alredy exists"})
        return
    }

    user = new User({
        email,
        password,
        name,
        avatar:avatar || ""
    })

    const salt = await becrypt.genSalt(10)
    user.password = await becrypt.hash(password,salt)
    await user.save()
    const token = genarateToken(user)
    
    res.json({success:true,token})

  } catch (error) {
    console.log(error);
    res.status(500).json({success:false,msg:"Server Error"})
    
  }
}

export const loginUser = async(req:Request,res:Response) :Promise<void> =>{
  try {
    const {email,password} = req.body;
    console.log(req.body,'THIS IS EMAIL FROM LOGIN PAGE');
    
     const user = await User.findOne({email})
     if(!user){
      res.status(400).json({succes:false,msg:'User not found'})
      return
     }

     const isMatch = await becrypt.compare(password,user.password)
     if(!isMatch){
      res.status(400).json({success:false,msg:"Invalid credentials"})
      return
     }

     const token = genarateToken(user)
     res.json({
      success:true,
      token
     })
  } catch (error) {
    
  }
}