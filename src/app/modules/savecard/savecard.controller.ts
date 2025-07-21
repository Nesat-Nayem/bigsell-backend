import { NextFunction, Request, Response } from "express";
import { SaveCard } from "./savecard.model";
import { saveCardValidation, saveCardUpdateValidation } from "./savecard.validation";
import { appError } from "../../errors/appError";
import { userInterface } from "../../middlewares/userInterface";
// import { userInterface } from "../auth/auth.interface";

export const createSaveCard = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  
  try {
    const { cardNumber, expiryDate, cvv, nameOnCard, isDefault } = req.body;
    
    // Validate the input
    const validatedData = saveCardValidation.parse({ 
      cardNumber, 
      expiryDate,
      cvv,
      nameOnCard,
      isDefault: isDefault === 'true' || isDefault === true
    });

    // If this card is set as default, unset any existing default cards
    if (validatedData.isDefault) {
      await SaveCard.updateMany(
        { userId: req.user._id, isDeleted: false },
        { isDefault: false }
      );
    }

    // Create a new saved card
    const saveCard = new SaveCard({
      ...validatedData,
      userId: req.user._id
    });
    await saveCard.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Card saved successfully",
      data: saveCard,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSaveCards = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const saveCards = await SaveCard.find({ 
      userId: req.user._id,
      isDeleted: false 
    }).sort({ isDefault: -1, createdAt: -1 });
    
    if (saveCards.length === 0) {
      res.json({
        success: true,
        statusCode: 200,
        message: "No saved cards found",
        data: [],
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Saved cards retrieved successfully",
      data: saveCards,
    });
  } catch (error) {
    next(error);
  }
};

export const getSaveCardById = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const saveCard = await SaveCard.findOne({ 
      _id: req.params.id, 
      userId: req.user._id,
      isDeleted: false 
    });
    
    if (!saveCard) {
      return next(new appError("Saved card not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Saved card retrieved successfully",
      data: saveCard,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSaveCardById = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const cardId = req.params.id;
    const { expiryDate, nameOnCard, isDefault } = req.body;
    
    // Find the card to update
    const saveCard = await SaveCard.findOne({ 
      _id: cardId, 
      userId: req.user._id,
      isDeleted: false 
    });
    
    if (!saveCard) {
      return next(new appError("Saved card not found", 404));
    }

    // Prepare update data
    const updateData: any = {};
    
    if (expiryDate !== undefined) {
      updateData.expiryDate = expiryDate;
    }
    
    if (nameOnCard !== undefined) {
      updateData.nameOnCard = nameOnCard;
    }
    
    if (isDefault !== undefined) {
      updateData.isDefault = isDefault === 'true' || isDefault === true;
    }

    // Validate the update data
    if (Object.keys(updateData).length > 0) {
      const validatedData = saveCardUpdateValidation.parse(updateData);
      
      // If this card is being set as default, unset any existing default cards
      if (validatedData.isDefault) {
        await SaveCard.updateMany(
          { userId: req.user._id, isDeleted: false, _id: { $ne: cardId } },
          { isDefault: false }
        );
      }
      
      // Update the card
      const updatedCard = await SaveCard.findByIdAndUpdate(
        cardId,
        validatedData,
        { new: true }
      );

      res.json({
        success: true,
        statusCode: 200,
        message: "Saved card updated successfully",
        data: updatedCard,
      });
      return;
    }

    // If no updates provided
    res.json({
      success: true,
      statusCode: 200,
      message: "No changes to update",
      data: saveCard,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSaveCardById = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const saveCard = await SaveCard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    
    if (!saveCard) {
      return next(new appError("Saved card not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Saved card deleted successfully",
      data: saveCard,
    });
  } catch (error) {
    next(error);
  }
};