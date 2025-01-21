import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import ErrorHandler from "../middleware/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
import bcrypt from 'bcryptjs';

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
    let {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        role,
    } = req.body;

    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob ||
        !nic ||
        !role
    ) {
        return next(new ErrorHandler("Please fill out the form", 400));
    }

    const user = await User.findOne({ email });
    if (user) {
        return next(new ErrorHandler("User already registered", 400));
    }

    await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        role,
    });

    generateToken(user, "User Registered!", 200, res);
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password, confirmPassword, role } = req.body;

    if (!email || !password || !confirmPassword || !role) {
        return next(new ErrorHandler("Please provide all details", 400));
    }

    if (password !== confirmPassword) {
        return next(new ErrorHandler("Password and confirm password do not match", 400));
    }

    const user = await User.findOne({ email }).select("password role");
    if (!user) {
        return next(new ErrorHandler("Invalid password or email", 400));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid password or email", 400));
    }

    if (role !== user.role) {
        return next(new ErrorHandler("User with this role not found!", 400));
    }

    generateToken(user, "User login successful!", 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
    let {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
    } = req.body;

    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob ||
        !nic
    ) {
        return next(new ErrorHandler("Please fill out the form", 400));
    }

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} with this email already exists!`, 400));
    }

    await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        role: "Admin",
    });

    res.status(200).json({
        success: true,
        message: "New Admin Registered"
    });
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
    const doctors = await User.find({ role: "Doctor" });
    res.status(200).json({
        success: true,
        doctors,
    });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
    });
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
    res.clearCookie("adminToken", {
        httpOnly: true,
        path: "/", // Match the path where the cookie was set
    });
    res.status(200).json({
        success: true,
        message: "Admin logged out successfully!",
    });
});

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
    res.clearCookie("PatientToken", {
        httpOnly: true,
        path: "/", // Match the path where the cookie was set
    });
    res.status(200).json({
        success: true,
        message: "Patient logged out successfully!",
    });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Doctor Avatar required!", 400));
    }

    const { docAvatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(docAvatar.mimetype)) {
        return next(new ErrorHandler("File format not supported!", 400));
    }

    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        doctorDepartment,
    } = req.body;

    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob ||
        !nic ||
        !doctorDepartment
    ) {
        return next(new ErrorHandler("Please provide full details!", 400));
    }

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} already registered with this email`, 400));
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error("Cloudinary Error!", cloudinaryResponse.error || "Unknown Cloudinary Error");
        return next(new ErrorHandler("Failed to upload avatar!", 500));
    }

    // Hash the password before saving the doctor
    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password: hashedPassword, // Store the hashed password
        gender,
        dob,
        nic,
        doctorDepartment,
        role: "Doctor",
        docAvatar: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });

    res.status(200).json({
        success: true,
        message: "New Doctor Registered!",
        doctor,
    });
});

export const deleteDoctor = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body; // Get the email from the request body

    if (!email) {
        return next(new ErrorHandler("Please provide the doctor's email!", 400));
    }

    // Check if the doctor exists in the database
    const doctor = await User.findOne({ email, role: "Doctor" });

    if (!doctor) {
        return next(new ErrorHandler("Doctor not found with this email!", 404));
    }

    // Delete the doctor from the database
    await User.deleteOne({ email });

    res.status(200).json({
        success: true,
        message: `Doctor with email ${email} deleted successfully!`,
    });
});

