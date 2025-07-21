import { NextFunction, Request, Response } from "express";
import { Pricing } from "./pricing.model";
import { pricingValidation, pricingUpdateValidation } from "./pricing.validation";
import { appError } from "../../errors/appError";

export const createPricing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  
  
  try {
    const { title, price, description, features, color } = req.body;
    
    // Check if pricing with same title already exists
    const existingPricing = await Pricing.findOne({ title, isDeleted: false });
    if (existingPricing) {
      next(new appError("Pricing plan with this title already exists", 400));
      return;
    }

    // Validate the input
    const validatedData = pricingValidation.parse({ 
      title, 
      price,
      description,
      features: Array.isArray(features) ? features : JSON.parse(features),
      color
    });

    // Create a new pricing plan
    const pricing = new Pricing(validatedData);
    await pricing.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Pricing plan created successfully",
      data: pricing,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllPricingPlans = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pricingPlans = await Pricing.find({ isDeleted: false }).sort({ createdAt: -1 });
    
    if (pricingPlans.length === 0) {
      next(new appError("No pricing plans found", 404));
      return;
    }
    
    res.json({
      success: true,
      statusCode: 200,
      message: "Pricing plans retrieved successfully",
      data: pricingPlans,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getPricingPlanById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pricingPlan = await Pricing.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!pricingPlan) {
      next(new appError("Pricing plan not found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Pricing plan retrieved successfully",
      data: pricingPlan,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updatePricingPlanById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pricingId = req.params.id;
    
    // Find the pricing plan to update
    const pricingPlan = await Pricing.findOne({ 
      _id: pricingId, 
      isDeleted: false 
    });
    
    if (!pricingPlan) {
      next(new appError("Pricing plan not found", 404));
      return;
    }

    // Prepare update data
    const updateData: any = {};
    
    if (req.body.title) {
      // Check if new title already exists
      if (req.body.title !== pricingPlan.title) {
        const existingPricing = await Pricing.findOne({ 
          title: req.body.title, 
          isDeleted: false,
          _id: { $ne: pricingId } 
        });
        
        if (existingPricing) {
          next(new appError("Pricing plan with this title already exists", 400));
          return;
        }
      }
      updateData.title = req.body.title;
    }

    if (req.body.price) updateData.price = req.body.price;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.color) updateData.color = req.body.color;
    
    if (req.body.features) {
      updateData.features = Array.isArray(req.body.features) 
        ? req.body.features 
        : JSON.parse(req.body.features);
    }

    // Validate the update data
    if (Object.keys(updateData).length > 0) {
      const validatedData = pricingUpdateValidation.parse(updateData);
      
      // Update the pricing plan
      const updatedPricingPlan = await Pricing.findByIdAndUpdate(
        pricingId,
        validatedData,
        { new: true }
      );

      res.json({
        success: true,
        statusCode: 200,
        message: "Pricing plan updated successfully",
        data: updatedPricingPlan,
      });
      return;
    }

    // If no updates provided
    res.json({
      success: true,
      statusCode: 200,
      message: "No changes to update",
      data: pricingPlan,
    });
    return;

  } catch (error) {
    next(error);
  }
};

export const deletePricingPlanById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pricingPlan = await Pricing.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    
    if (!pricingPlan) {
      next(new appError("Pricing plan not found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Pricing plan deleted successfully",
      data: pricingPlan,
    });
    return;
  } catch (error) {
    next(error);
  }
};