import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User}  from '../models/user.model.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt  from 'jsonwebtoken';

const genrateAccessandRefreshToken=async(userId)=>{
    try{
        const user = await  User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken=await user.generatRefreshToken();

         user.refreshToken=refreshToken
         await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken};

    }
    catch(error){
       throw new ApiError(500,"Something went wrong while genrating access and refresh token")
    }
}

const registerUser = asyncHandler(async(req,res)=>{
   
    /*get user details from fronted*/
    const {email,name,Mobile_number,password}=req.body
    // console.log("email :",email);

    //validation all filed empty or not
    if([ email,name,Mobile_number,password ].some((field)=>field?.trim==="")){
        throw new  ApiError(400,'All Fields Are Required')
    }
   
    //check user alreday exists or not 
    const userExist= await User.findOne({
        $or:[{email},{Mobile_number}]
    })

    if(userExist){
        throw new ApiError(409,"Email And Mobile Number Already Exists ")
    }

    //create user object-create entry in db
    const user = await User.create({
        name,
        email:email.toLowerCase(),
        Mobile_number,
        password
    })
    
    //remove password and refreshtoken form response field
    const createduser = await User.findById(user._id).select(
        "-password -refreshToken"
    ) 

    //check user create or not 
    if(!createduser){
        throw new ApiError(500,"Something Went wrong while creating an account! :(")
    }
    
    //return response
    return res.status(201).json(
        new ApiResponse(200,createduser,"Register Successfull :)")
    )
})

const loginUser = asyncHandler(async (req,res)=>{

    //get data from req body
    const {email,password} = req.body;

    if(!email){
        throw new ApiError(400,"Email required")
    }

    //find user
    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404,"User does not exists")
    }

    //Check Password
    const isPasswordMatched = await user.isPasswordCorrect(password);

    if(!isPasswordMatched){
        throw new ApiError(401,"Invalid User Credentials")
    }

    //access and refresh token genration
    const {accessToken,refreshToken} = await genrateAccessandRefreshToken(user._id)

    const loggedInUser=await User.findById(user._id)
    .select( "-password -refreshToken")

    //set access token to cookie

    const options={
        httpOnly:true,
        secure:true
    }//modified by only server not fronted

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie( "refreshToken" ,refreshToken ,options )
    .json(
            new ApiResponse(
                200,
                {
                 user:loggedInUser,accessToken,refreshToken
                },
                 "Logged In Successfully"
            ) 
    )
   

})

const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            refreshToken:undefined
        }
    
    },
    {
        new:true
    }

    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,"User logged Out"))
    
}
)

const refreshAccessToken=asyncHandler(async (req,res)=> {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorize request")
    }

    try {
        const decodedToken=jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }
    
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh Token expired or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
       const {accessToken,newrefreshToken}=await genrateAccessandRefreshToken(user._id)
    
        return res.status(200)
        .cookie('accessToken',accessToken,options)
        .cookie('refreshToken',newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken:newrefreshToken},
                "Access Token Refreshed"
            )
        )
    
    } catch (error) {
       throw new ApiError(401,error?.message||"Inavlid Refresh Token")   
    }

})

export {registerUser,loginUser,logoutUser,refreshAccessToken}

