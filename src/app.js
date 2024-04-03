import express from "express";
import cors  from 'cors';
import cookieParser from "cookie-parser";

const  app= express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser())

//import route
import userRouter from './routes/user.routes.js'

app.use( "/api/v1/user", userRouter);

//seller import route

import sellerRouter from './routes/seller.route.js'

app.use("/api/v1/seller",sellerRouter)

//product import route
import productRouter from './routes/product.route.js'
app.use('/api/v1/product',productRouter)


//cart import route
import cartRouter from './routes/cart.route.js'
app.use("/api/v1/cart",cartRouter)
export {app}

