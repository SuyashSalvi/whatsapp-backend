 import mongoose from "mongoose";

 const whatsappSchema =  mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    recevied: Boolean,
 });

//collection
export default mongoose.model('messageContents',whatsappSchema);