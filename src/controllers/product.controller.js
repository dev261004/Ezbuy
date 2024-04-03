import {Product} from  '../models/product.model.js';
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//get all products
const getAllProducts= asyncHandler(async (req,res)=>{
    try {
        const products = await Product.find();
        if(!products){
            throw new ApiError(404, "unable to fetching products");
        }
        return res.status(200).json(new ApiResponse(products));
    } catch (error) {
        throw new ApiError(500,'Server Error for getting All Products',{});
    }
    
})

//get prpduct by id
const getProductById=asyncHandler(async (req,res)=>{
  
    try {
        const product = await  Product.findById(req.params.id);
        if(!product){
            throw new ApiError(404, "No product found");
        }
        return res.status(200).json(new ApiResponse("success",true,"Product Found",product));
    } catch (error) {
        throw new ApiError(500,"Server Error for  Getting a Single Product",{});
    }

})

//create new product
const createProduct = asyncHandler(async(req,res)=>{
    const {name,price, description,quantity,category}= req.body;
    
    //check if all field empty or not
    if([ name,price, description,quantity,category ].some((field)=>field?.trim==="")){
        throw new ApiError(400,'All Fields Are Required')
    }

    //product entry in database -->two methods
    //1. Using Product.create():
  try {
      const product = await Product.create({
         name, price ,description, quantity, category,createdBy: req.user._id
      })
  
      /*2. Using new Product() and save() separately: this met
      const newProduct = new Product({
          name,
          description,
          price,
          quantity,
          category,
        });
    
        const savedProduct = await newProduct.save();*/
  
        return res.status(201).json(new ApiResponse(200,product,"product successfully created :)"));
  } catch (error) {
    throw new ApiError(500,"unable to create product");
  }
})

//update product by id
const allowedUpdates = ['name', 'description', 'price', 'category', 'quantity'];
const updateProductById = asyncHandler(async (req,res)=>{

    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

    if (!isValidUpdate) {
      throw new ApiError(400,'Invalid update fields');
    }
  
    const _id = req.params.id;
    try {
      
      const product = await Product.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true });
      if (!product) {
        throw new ApiError(404,'Product not found');
      }
      
      return res.status(201).json(new ApiResponse(200,product,"product updated succesfully :D"))
    } catch (error) {
       throw new ApiError(400,"Failed to upadte product");
    }
})

//delete product by id
const deleteProductById = asyncHandler(async(req,res)=>{
    const _id = req.params.id;
    try {
      const product = await Product.findByIdAndDelete(_id);
      if (!product) {
       throw new ApiError(404,'Product not found');
      }
      return  res.status(200).json(new ApiResponse(200,'Product has been deleted'));
    } catch (error) {
            console.error(error); // Log the error for debugging
            throw new ApiError(500, 'Failed to delete product. Please try again later.', {});
          }
          
    
})

export {getAllProducts,getProductById,createProduct,updateProductById,deleteProductById}