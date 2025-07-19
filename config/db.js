import mongoose from "mongoose";

const connectDb = async ()=> {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Data base is connected")
    } catch (error) {
        console.log(error)        
    }
}
export default connectDb;