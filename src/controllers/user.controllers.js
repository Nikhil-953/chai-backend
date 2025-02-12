import { asynchandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

const registerUser = asynchandler( async (req,res) => {
    //get user details from frontend
    //validation-not empty
    //check user already exist or not
    //check for images,check avatar

    const {fullname,email,username,password} = req.body
    console.log("email",email);

    if(fullname === "" || email === "" || username === "" || password === ""){
        throw new ApiError(400,"All fields are required")
    }

    const existingUser =User.findOne({
        $or:[{ email },{ username }]
    })

    if(existingUser){
        throw new ApiError(409,"User already exist")
    }

   const avatatlocalpath= req.files?.avatar[0]?.path;
   const coverimagelocalpath = req.files?.coverimage[0]?.path;

   if(!avatarlocalpath){
       throw new ApiError(400,"Avatar is required")
   }

   const avatar = await uploadOnCloudinary(avatarlocalpath)
   const coverImage = await uploadOnCloudinary(coverimagelocalpath)
   

   if(!avatar){
    throw new ApiError(400,"Avatar is required")
   }

  const user = await User.create({
       fullname,
       email,
       username: username.toLowerCase(),
       password,
       avatar: avatar.url,
       coverImage: coverImage?.url || null
   })

   const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createduser){
       throw new ApiError(500,"something went wrong while creating user")
   }

   return res.status(201).json(
    new ApiResponse(201,"User created successfully",createduser))
})



export { registerUser}