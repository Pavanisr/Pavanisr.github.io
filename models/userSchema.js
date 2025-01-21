import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
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
    nic:{
        type: String,
        required:true,
        minlength: [12, "nic must contains exact 10 digits!"],
        maxlength: [13, "nic must contains exact 10 digits!"]
    },
    dob:{
        type: Date,
        required: [true, "DOB is required"]
    },
    gender:{
        type: String,
        required: true,
        enum: ["Male","Female"]
    },
    password:{
        type: String,
        minLength: [8,"Password must contains at least 8 characters"],
        required: true,
        select: false,
    },
    role:{
        type:String,
        required: true,
        enum:["Admin","Patient","Doctor"],
    },
    doctorDepartment:{
        type: String
    },
    docAvatar:{
        public_id: String,
        url: String,
    },
});




userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);
});


userSchema.methods.comparePassword = async function( enteredPassword){
    
    return await bcrypt.compare(enteredPassword,this.password);
};

userSchema.methods.generatejsonWebToken = function(){
    return jwt.sign({id: this._id},process.env.JWT_SECRET_KEY,{
        expiresIn: process.env.JWT_EXPIRES,
    })
}


export const User = mongoose.model("User",userSchema);