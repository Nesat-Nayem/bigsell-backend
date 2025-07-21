import { NextFunction, Request, Response } from "express";
// import { TermsCondition } from "./privacy-policy.model";
// import { privacyPolicyValidation } from "./privacy-policy.validation";
import { appError } from "../../errors/appError";
import { TermsCondition } from "./terms-condition.model";
import { TermsConditionValidation } from "./terms-condition.validation";

export const getTermsCondition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  try {
    // Get the privacy policy or create a default one if it doesn't exist
    let termsCondition = await TermsCondition.findOne();
    
    if (!termsCondition) {
      termsCondition = await TermsCondition.create({
        content: '<p> Terms and Conditions content goes here.</p>'
      });
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Terms and Conditions retrieved successfully",
      data: termsCondition,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateTermsCondition = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content } = req.body;
    
    // Validate the input
    const validatedData = TermsConditionValidation.parse({ content });
    
    // Find the privacy policy or create a new one if it doesn't exist
    let termsCondition = await TermsCondition.findOne();
    
    if (!termsCondition) {
      termsCondition = new TermsCondition(validatedData);
      await termsCondition.save();
    } else {
      // Update the existing privacy policy
      termsCondition.content = content;
      await termsCondition.save();
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Privacy policy updated successfully",
      data: termsCondition,
    });
    return;
  } catch (error) {
    next(error);
  }
};