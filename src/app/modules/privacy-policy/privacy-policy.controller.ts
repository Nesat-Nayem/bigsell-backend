import { NextFunction, Request, Response } from "express";
import { PrivacyPolicy } from "./privacy-policy.model";
import { privacyPolicyValidation } from "./privacy-policy.validation";
import { appError } from "../../errors/appError";

export const getPrivacyPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  
  try {
    // Get the privacy policy or create a default one if it doesn't exist
    let privacyPolicy = await PrivacyPolicy.findOne();
    
    if (!privacyPolicy) {
      privacyPolicy = await PrivacyPolicy.create({
        content: '<p>Privacy Policy content goes here.</p>'
      });
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Privacy policy retrieved successfully",
      data: privacyPolicy,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updatePrivacyPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content } = req.body;
    
    // Validate the input
    const validatedData = privacyPolicyValidation.parse({ content });
    
    // Find the privacy policy or create a new one if it doesn't exist
    let privacyPolicy = await PrivacyPolicy.findOne();
    
    if (!privacyPolicy) {
      privacyPolicy = new PrivacyPolicy(validatedData);
      await privacyPolicy.save();
    } else {
      // Update the existing privacy policy
      privacyPolicy.content = content;
      await privacyPolicy.save();
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Privacy policy updated successfully",
      data: privacyPolicy,
    });
    return;
  } catch (error) {
    next(error);
  }
};