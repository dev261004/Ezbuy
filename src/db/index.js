import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const  connectDB = async () => {
    try{
       const connection_mongodb=  await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
       console.log(`\n MONGODB CONNECTED !! DB HOST: ${connection_mongodb.connection.host}`);
    }
    catch(error){
        console.log("Mongodb connection error ",error);
        process.exit(1);
    }
}
export default connectDB;