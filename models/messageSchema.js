import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required:true,
        minlength: [3, "first name must contains at least 3 characters!"]
    },
    lastName:{
        type: String,
        required:true,
        minlength: [3, "last name must contains at least 3 characters!"]
    },
    email:{
        type: String,
        required:true,
        validate: [validator.isEmail, "Please provide valid email"]

    },
    phone:{
        type: String,
        required:true,
        minlength: [10, "phone number must contains exact 10 digits!"],
        maxlength: [10, "phone number must contains exact 10 digits!"]
    },
    message:{
        type: String,
        required:true,
        minlength: [10, "message must contains at least 10 characters!"]
    },


  
});

export const Message = mongoose.model("Message",messageSchema);