import { NextFunction, Request, Response } from "express";
import { HelpSupport } from "./help-support.model";
import { helpSupportValidation } from "./help-support.validation";
import { appError } from "../../errors/appError";

export const getHelpSupport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  
  try {
    // Get the help and support content or create a default one if it doesn't exist
    let helpSupport = await HelpSupport.findOne();
    
    if (!helpSupport) {
      helpSupport = await HelpSupport.create({
        content: '<p>Help and Support content goes here.</p>'
      });
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Help and support content retrieved successfully",
      data: helpSupport,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateHelpSupport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content } = req.body;
    
    // Validate the input
    const validatedData = helpSupportValidation.parse({ content });
    
    // Find the help and support content or create a new one if it doesn't exist
    let helpSupport = await HelpSupport.findOne();
    
    if (!helpSupport) {
      helpSupport = new HelpSupport(validatedData);
      await helpSupport.save();
    } else {
      // Update the existing help and support content
      helpSupport.content = content;
      await helpSupport.save();
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Help and support content updated successfully",
      data: helpSupport,
    });
    return;
  } catch (error) {
    next(error);
  }
};