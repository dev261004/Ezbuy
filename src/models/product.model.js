import mongoose from "mongoose";
const Schema=mongoose.Schema;

const productSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    descr:{
        type:String,
        required:true,
        trim:true
    },
    quantity:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true,
        trim:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
})

export const Product = mongoose.model("Product",productSchema)


