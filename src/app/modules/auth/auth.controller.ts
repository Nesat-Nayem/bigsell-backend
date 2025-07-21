import { Request, Response } from "express";
import { User } from "./auth.model";
import { RequestHandler } from 'express';
import { activateUserValidation, authValidation, emailCheckValidation, loginValidation, phoneCheckValidation, requestOtpValidation, resetPasswordValidation, updateUserValidation, verifyOtpValidation } from "./auth.validation";
import { generateToken } from "../../config/generateToken";
// import { AdminStaff } from "../admin-staff/admin-staff.model";

export const singUpController: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { name, password, img, phone, email, role } = authValidation.parse(req.body);

    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Email already exists",
      });
      return;
    }
    
    
    
    
    
    

    // Check for existing phone
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Phone number already exists",
      });
      return;
    }


    const user = new User({ name, password, img, phone, email, role });
    await user.save();

    const { password: _, ...userObject } = user.toObject();

    res.status(201).json({
      success: true,
      statusCode: 200,
      message: "User registered successfully",
      data: userObject,
    });
    return;
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      statusCode: 500, 
      message: error.message 
    });
  }
};


// Add these functions to your existing controller file

// Utility function to generate OTP
const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Request OTP handler
export const requestOtp: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { phone } = requestOtpValidation.parse(req.body);

    // Find or create user
    let user = await User.findOne({ phone });
    
    if (!user) {
      user = new User({
        phone,
        role: 'user',
        status: 'active'
      });
    }

    // Generate OTP and set expiration
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    
    await user.save();
    
    res.json({
      success: true,
      statusCode: 200,
      message: "OTP sent successfully",
      data: { 
        otp,
        phone 
      }
    });
    return;
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
  }
};


// Verify OTP and login
export const verifyOtp: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { phone, otp } = verifyOtpValidation.parse(req.body);
    
    // Find user by phone
    const user = await User.findOne({ phone });
    
    if (!user) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found"
      });
      return;
    }
    
    // Check if OTP is valid and not expired
    if (!user.compareOtp(otp)) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid or expired OTP"
      });
      return;
    }
    
    // Generate token for the user
    const token = generateToken(user);
    
    // Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    // Remove password from response
    const { password: _, ...userObject } = user.toObject();
    
    res.json({
      success: true,
      statusCode: 200,
      message: "OTP verified successfully",
      token,
      data: userObject
    });
    return;
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
  }
};


export const updateUser: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    // Create a clean request body by filtering out undefined/null values
    const cleanBody = Object.fromEntries(
      Object.entries(req.body).filter(([_, v]) => v !== undefined && v !== null)
    );
    
    // Validate the clean data
    const validatedData = updateUserValidation.parse(cleanBody);
    
    // Check if email is being updated with a non-empty value and if it already exists
    if (validatedData.email && validatedData.email.length > 0) {
      const existingUser = await User.findOne({
        email: validatedData.email,
        _id: { $ne: req.params.id }
      });
      
      if (existingUser) {
        res.status(400).json({
          success: false,
          statusCode: 400,
          message: "Email already exists"
        });
        return;
      }
    }
    
    // If email is empty string, remove it from update data
    if (validatedData.email === '') {
      delete validatedData.email;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found"
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "User updated successfully",
      data: updatedUser
    });
    return;
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
  }
};


export const loginController: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { email, password } = loginValidation.parse(req.body);

    // First try to find in User model
    let user = await User.findOne({ email });
    let userType = 'user';
    
    // If not found in User model, try AdminStaff model
    // if (!user) {
    //   user = await AdminStaff.findOne({ email });
    //   userType = 'admin-staff';
    // }
    
    if (!user) {
      res.status(401).json({
        success: false,
        statusCode: 400,
        message: "Invalid email or password",
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        statusCode: 400,
        message: "Invalid email or password",
      });
      return;
    }



    const token = generateToken(user);

    // remove password
    const { password: _, ...userObject } = user.toObject();

    res.json({
      success: true,
      statusCode: 200,
      message: "User logged in successfully",
      token,
      data: userObject,
    });
    return;
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      statusCode: 400, 
      message: error.message 
    });
    return;
  }
};

export const getAllUsers: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const users = await User.find({}, { password: 0 });
    
    if (users.length === 0) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "No users found",
      });
      return;
    }
    
    res.json({
      success: true,
      statusCode: 200,
      message: "Users retrieved successfully",
      data: users,
    });
    return;
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      statusCode: 500, 
      message: error.message 
    });
    return;
  }
};

export const getUserById: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const user = await User.findById(req.params.id, { password: 0 });
    
    if (!user) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "User retrieved successfully",
      data: user,
    });
    return;
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      statusCode: 500, 
      message: error.message 
    });
    return;
  }
};

export const resetPassword: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { phone, newPassword } = resetPasswordValidation.parse(req.body);
    
    const user = await User.findOne({ phone });
    if (!user) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found"
      });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      statusCode: 200,
      message: "Password reset successfully"
    });
    return;
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
    return;
  }
};

export const activateUser: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { phone } = activateUserValidation.parse(req.body);
    
    const user = await User.findOne({ phone });
    if (!user) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found"
      });
      return;
    }

    (user as any).status = 'active';
    await user.save();

    res.json({
      success: true,
      statusCode: 200,
      message: "User activated successfully"
    });
    return;
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
    return;
  }
};

export const checkPhoneExists: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { phone } = phoneCheckValidation.parse(req.body);
    
    const user = await User.findOne({ phone });
    
    if (!user) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Phone number not found"
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Phone number exists",
      data: {
        exists: true,
        phone: user.phone
      }
    });
    return;
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
    return;
  }
};

export const checkEmailExists: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { email } = emailCheckValidation.parse(req.body);
    
    const user = await User.findOne({ email });
    
    if (!user) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Email not found"
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Email exists",
      data: {
        exists: true,
        email: user.email
      }
    });
    return;
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message
    });
    return;
  }
};
