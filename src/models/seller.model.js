import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const  Schema = mongoose.Schema;

const SellerSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type:String,
        required: [true, "Password is Required"],
    },
    Mobile_number: {
        type: Number,
        require: true,
        unique: true,
        validate: {
          validator: function (v) {
            // Check if mobile number contains exactly 10 digits
            return /^\d{10}$/.test(v);
          },
          message: (props) =>
            `${props.value} is not a valid mobile number! Must be exactly 10 digits.`,
        },
      },
      seller_name:{
        type:String,
        required:true,
        index: true,
        trim: true,
      },
      company_name:{
        type:String,
        required:true,
        trim: true,
        unique:true
      },
      company_address:{
        type:String,
        required:true
      },
      refreshToken: {
        type: String,
      }
},
   {
    timestamps: true,
   }
  )

//midellware for encrypt password
SellerSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });

SellerSchema.methods.isPasswordCorrect=async function(password){
    return  await bcrypt.compare(password, this.password)
}



SellerSchema.methods.generateAccessToken =function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      Mobile_number: this.Mobile_number,
      seller_name: this.seller_name,
      company_address:this.company_address,
      company_name:this.company_name
    },
    process.env.SELLER_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.SELLER_ACCESS_TOKEN_EXPIRY,
    }
  );
};

SellerSchema.methods.generatRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.SELLER_REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.SELLER_REFRESH_TOKEN_EXPIRY,
    }
  );
};
export const Seller = mongoose.model("Seller",SellerSchema )

