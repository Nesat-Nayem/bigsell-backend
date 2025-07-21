import { NextFunction, Request, Response } from "express";
import { KYC } from "./kyc.model";
import { User } from "../auth/auth.model";
import { kycValidation, kycUpdateValidation, aadhaarVerificationValidation, panVerificationValidation, gstVerificationValidation } from "./kyc.validation";
import { appError } from "../../errors/appError";
import { userInterface } from "../../middlewares/userInterface";
import { Pricing } from "../pricing/pricing.model";
import { verificationService } from "../../services/verificationService";

// Generate random password
const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
  
};

export const submitKYC = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the input
    const validatedData = kycValidation.parse(req.body);

    // Check if user already exists by email or phone
    let user = await User.findOne({ 
      $or: [
        { email: validatedData.email }, 
        { phone: validatedData.phone }
      ] 
    });
    let temporaryPassword = '';
    let isNewUser = false;
    let message = "";
    let packageFeatures: string[] = [];

    // Find the pricing plan and get its features
    if (validatedData.selectedPackage?._id) {
        const plan = await Pricing.findById(validatedData.selectedPackage._id);
        if (plan) {
            packageFeatures = plan.features;
        } else {
            return next(new appError("Selected pricing plan not found.", 404));
        }
    } else {
        return next(new appError("Pricing plan ID is missing.", 400));
    }

    if (user) { // User found by email or phone
        const existingKYCForUser = await KYC.findOne({ userId: user._id });
        if (existingKYCForUser) {
            next(new appError("KYC already submitted for this user.", 400));
            return;
        }

        // Update existing user details for KYC
        (user as any).name = validatedData.fullName;
        (user as any).email = validatedData.email; // Ensure email is updated/set
        (user as any).role = 'vendor';
        (user as any).status = 'pending';
        (user as any).packageFeatures = packageFeatures;

        if (!(user as any).password) { // If user was OTP-only and has no password
            temporaryPassword = generateRandomPassword();
            (user as any).password = temporaryPassword; // This will be hashed by pre-save hook
            message = "Existing user updated to vendor, KYC submitted, and temporary password generated.";
        } else {
            message = "Existing user KYC submitted.";
        }
        await user.save();

    } else { // No user found, create a new one
      temporaryPassword = generateRandomPassword();
      user = new User({
        name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        password: temporaryPassword, // Will be hashed by pre-save hook
        role: 'vendor',
        status: 'pending',
        packageFeatures: packageFeatures,
      });
      await user.save();
      isNewUser = true;
      message = "New vendor user created and KYC submitted successfully.";
    }

    if (!user || !user._id) {
        next(new appError("User creation or update failed, cannot submit KYC.", 500));
        return;
    }
    
    // Safeguard: Check if KYC details (email/phone) conflict with *another* user's KYC
    const kycConflictCheck = await KYC.findOne({
        $or: [
            { email: validatedData.email },
            { phone: validatedData.phone }
        ],
        userId: { $ne: user._id } 
    });

    if (kycConflictCheck) {
        next(new appError("KYC details (email/phone) conflict with another existing submission unrelated to this user.", 400));
        return;
    }

    const kyc = new KYC({
      ...validatedData,
      userId: user._id,
      submittedAt: new Date(),
      status: 'pending'
    });

    await kyc.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: message,
      data: {
        kycId: kyc._id,
        userId: user._id,
        email: (user as any).email,
        temporaryPassword: temporaryPassword || undefined, // Send only if newly generated
        status: 'pending'
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllKYCSubmissions = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    // Get total count
    const totalItems = await KYC.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);

    // Get submissions
    const submissions = await KYC.find(filter)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email phone')
      .populate('reviewedBy', 'name email')
      .lean();

    // Convert Map to plain object for each submission
    const formattedSubmissions = submissions.map(submission => {
      if (submission.adminComments instanceof Map) {
        submission.adminComments = Object.fromEntries(submission.adminComments);
      }
      return submission;
    });

    res.json({
      success: true,
      statusCode: 200,
      message: "KYC submissions retrieved successfully",
      data: {
        submissions: formattedSubmissions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit
        }
      },
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getKYCById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const kyc = await KYC.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('reviewedBy', 'name email');
    
    if (!kyc) {
      next(new appError("KYC submission not found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "KYC submission retrieved successfully",
      data: kyc,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getMyKYC = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const kyc = await KYC.findOne({ userId: req.user?._id })
      .populate('reviewedBy', 'name email')
      .lean();
    
    if (!kyc) {
      next(new appError("No KYC submission found", 404));
      return;
    }

    // Convert Map to plain object for frontend
    if (kyc.adminComments instanceof Map) {
      kyc.adminComments = Object.fromEntries(kyc.adminComments);
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Your KYC submission retrieved successfully",
      data: kyc,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const reviewKYC = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, adminComments } = req.body;
    const kycId = req.params.id;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      next(new appError("Invalid status. Must be 'approved', 'rejected', or 'pending'", 400));
      return;
    }

    const kyc = await KYC.findById(kycId);
    if (!kyc) {
      next(new appError("KYC submission not found", 404));
      return;
    }

    // Update KYC status
    kyc.status = status;
    
    // Handle adminComments - clear existing and add new entries
    if (kyc.adminComments) {
      kyc.adminComments.clear();
      if (adminComments && typeof adminComments === 'object') {
        Object.entries(adminComments).forEach(([key, value]) => {
          kyc.adminComments!.set(key, value as string);
        });
      }
    }
    
    kyc.reviewedAt = new Date();
    kyc.reviewedBy = req.user?._id;

    await kyc.save();

    // Update user status based on KYC approval
    if (kyc.userId) {
      const user = await User.findById(kyc.userId);
      if (user) {
        if (status === 'approved') {
          (user as any).status = 'active';
        } else if (status === 'rejected') {
          (user as any).status = 'pending';
        }
        await user.save();
      }
    }

    // Convert Map back to object for response
    const responseData = kyc.toObject();
    if (responseData.adminComments instanceof Map) {
      responseData.adminComments = Object.fromEntries(responseData.adminComments) as any;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: `KYC ${status} successfully`,
      data: responseData,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateKYC = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find existing KYC
    const existingKYC = await KYC.findOne({ userId: req.user?._id });
    if (!existingKYC) {
      next(new appError("No KYC submission found to update", 404));
      return;
    }

    // Only allow updates if status is rejected
    if (existingKYC.status !== 'rejected') {
      next(new appError("KYC can only be updated when status is rejected", 400));
      return;
    }

    // Validate update data
    const validatedData = kycUpdateValidation.parse(req.body);

    // Update KYC
    Object.assign(existingKYC, validatedData);
    existingKYC.status = 'pending'; // Reset to pending
    existingKYC.submittedAt = new Date(); // Update submission time
    
    // Clear previous comments
    if (existingKYC.adminComments) {
      existingKYC.adminComments.clear();
    }
    
    existingKYC.reviewedAt = undefined;
    existingKYC.reviewedBy = undefined;

    await existingKYC.save();

    res.json({
      success: true,
      statusCode: 200,
      message: "KYC updated and resubmitted successfully",
      data: existingKYC,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteKYC = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const kyc = await KYC.findByIdAndDelete(req.params.id);
    
    if (!kyc) {
      next(new appError("KYC submission not found", 404));
      return;
    }

    // Also delete the associated user if they were created during KYC submission
    if (kyc.userId) {
      const user = await User.findById(kyc.userId);
      if (user && user.role === 'vendor' && (user as any).status === 'pending') {
        await User.findByIdAndDelete(kyc.userId);
      }
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "KYC submission deleted successfully",
      data: kyc,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getKYCStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await KYC.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalSubmissions = await KYC.countDocuments();
    const recentSubmissions = await KYC.find()
      .sort({ submittedAt: -1 })
      .limit(5)
      .populate('userId', 'name email');

    const formattedStats = {
      total: totalSubmissions,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      approved: stats.find(s => s._id === 'approved')?.count || 0,
      rejected: stats.find(s => s._id === 'rejected')?.count || 0,
      recent: recentSubmissions
    };

    res.json({
      success: true,
      statusCode: 200,
      message: "KYC statistics retrieved successfully",
      data: formattedStats,
    });
    return;
  } catch (error) {
    next(error);
  }
};
// Document Verification Controllers

export const verifyAadhaar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = aadhaarVerificationValidation.parse(req.body);
    const { aadhaarNumber } = validatedData;

    const result = await verificationService.verifyAadhaar(aadhaarNumber);

    // Return success only if verification is actually successful
    const isSuccess = result.status === 'verified';
    
    res.json({
      success: isSuccess,
      statusCode: isSuccess ? 200 : 400,
      message: isSuccess ? 'Aadhaar verified successfully' : 'Aadhaar verification failed',
      data: result,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const verifyAadhaarOTP = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { aadhaarNumber, otp, sessionId } = req.body;

    if (!aadhaarNumber || !otp || !sessionId) {
      next(new appError('Aadhaar number, OTP, and session ID are required', 400));
      return;
    }

    const result = await verificationService.verifyAadhaarOTP(aadhaarNumber, otp, sessionId);

    const isSuccess = result.status === 'verified';
    
    res.json({
      success: isSuccess,
      statusCode: isSuccess ? 200 : 400,
      message: isSuccess ? 'Aadhaar OTP verified successfully' : 'Aadhaar OTP verification failed',
      data: result,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const verifyPAN = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = panVerificationValidation.parse(req.body);
    const { panNumber, name } = validatedData;

    const result = await verificationService.verifyPAN(panNumber, name);

    res.json({
      success: true,
      statusCode: 200,
      message: result.status === 'verified' ? 'PAN verified successfully' : 'PAN verification failed',
      data: result,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const verifyGST = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = gstVerificationValidation.parse(req.body);
    const { gstNumber } = validatedData;

    const result = await verificationService.verifyGST(gstNumber);

    res.json({
      success: true,
      statusCode: 200,
      message: result.status === 'verified' ? 'GST verified successfully' : 'GST verification failed',
      data: result,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getVerificationStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await verificationService.getVerificationStats();

    res.json({
      success: true,
      statusCode: 200,
      message: "Verification statistics retrieved successfully",
      data: stats,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const healthCheck = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const health = await verificationService.healthCheck();

    res.json({
      success: true,
      statusCode: health.overall ? 200 : 503,
      message: health.overall ? "All services are healthy" : "Some services are unhealthy",
      data: health,
    });
    return;
  } catch (error) {
    next(error);
  }
};