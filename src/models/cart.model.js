import mongoose from "mongoose";
const Schema=mongoose.Schema;

const cartItemSchema= new Schema({
    productId:{
        type:Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min:1
    }
})

const CartSchema=new Schema({
    userId: {
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[cartItemSchema],
    totalPrice:{
        type:Number,
        default:0
    }                                  
})

export const Cart = mongoose.model("Cart", CartSchema)