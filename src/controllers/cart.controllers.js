import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {User} from '../models/user.model.js';
import {Product} from  '../models/product.model.js';
import {Cart} from '../models/cart.model.js';

//get current user's cart
const getCartById= asyncHandler(async(req,res)=>{
    try {
        const cart = await Cart.findOne({userId:req.user._id}).populate('items.productId');
        if(!cart){
            throw new ApiError(404, 'No Cart Found! :(');
        }
        return res.status(200).json(new ApiResponse(500,cart ));
    } catch (error) {
        throw new ApiError(500,'Failed to retrieve cart');
    }
})

//add tem to cart
const addItem = asyncHandler(async(req,res)=>{
    const { productId, quantity } = req.body;

   try {
     const product = await Product.findById(productId);
     if(!product){
         throw new ApiError(404,"Product not found");
     }
 
     //checking whether the product is  in stock or not
     if(product.quantity<quantity){
         throw new ApiError(400,"stock not available");
     }

     const cart = await Cart.findOne( {userId:req.user._id});

     //create new cart if doesn't exist
     if(!cart){
       const newCart = new Cart({userId:req.user._id,items:[{productId,quantity}]});
       await newCart.save();
       return res.status(201).json(new ApiResponse(200,newCart,'cart succesfully created :)'));
     }

     const existingItem= cart.items.find(item=>item.productId.equals({productId}));

     if(existingItem){
        existingItem+=quantity;
     }
     else{
        cart.items.push({productId,quantity});
     }

     await cart.save();
   } catch (error) {
    throw new ApiError(500,'Failed to add item to cart');
   }      
})

//remove item from your cart
const removeCart = asyncHandler(async (req,res)=>{
    const itemId=req.params.itemId;

    try {
        const cart =await Cart.findOne({userId: req.user._id});

        if(!cart){
            throw new ApiError(404,'cart not found');
        }

        const index= cart.items.findIndex(item=>String(item._id)===itemId);

        if(index===-1){
            throw new ApiError(404,'Item not found in cart');
        }

        const removedItem = cart.items.splice(index,1)[0];
        cart.totalPrice-=removedItem.quantity*removedItem.productId.price;
        await cart.save();

        return res.status(200).json(new ApiResponse(200,cart,'item removed succesfully'));

    } catch (error) {
        throw new ApiError(500,'error occur while removing');
    }
})

export {getCartById,addItem,removeCart}