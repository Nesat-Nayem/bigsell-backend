import { NextFunction, Request, Response } from "express";
import { FAQ } from "./faq.model";
import { faqValidation, faqUpdateValidation } from "./faq.validation";
import { appError } from "../../errors/appError";
import { aiService } from "../../services/aiService";

export const createFAQ = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { question, answer, category, order, isActive } = req.body;
    
    // Validate the input
    const validatedData = faqValidation.parse({ 
      question, 
      answer,
      category,
      order: order ? parseInt(order as string) : undefined,
      isActive: isActive === 'true' || isActive === true
    });

    // Create a new FAQ
    const faq = new FAQ(validatedData);
    await faq.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "FAQ created successfully",
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllFAQs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get only active FAQs if requested
    const { active, category } = req.query;
    const filter: any = { isDeleted: false };
    
    if (active === 'true') {
      filter.isActive = true;
    }
    
    if (category) {
      filter.category = category;
    }
    
    const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: -1 });
    
    if (faqs.length === 0) {
      res.json({
        success: true,
        statusCode: 200,
        message: "No FAQs found",
        data: [],
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "FAQs retrieved successfully",
      data: faqs,
    });
  } catch (error) {
    next(error);
  }
};

export const getFAQById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const faq = await FAQ.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!faq) {
      return next(new appError("FAQ not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "FAQ retrieved successfully",
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFAQById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const faqId = req.params.id;
    const { question, answer, category, order, isActive } = req.body;
    
    // Find the FAQ to update
    const faq = await FAQ.findOne({ 
      _id: faqId, 
      isDeleted: false 
    });
    
    if (!faq) {
      return next(new appError("FAQ not found", 404));
    }

    // Prepare update data
    const updateData: any = {};
    
    if (question !== undefined) {
      updateData.question = question;
    }
    
    if (answer !== undefined) {
      updateData.answer = answer;
    }
    
    if (category !== undefined) {
      updateData.category = category;
    }
    
    if (order !== undefined) {
      updateData.order = parseInt(order as string);
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive === 'true' || isActive === true;
    }

    // Validate the update data
    if (Object.keys(updateData).length > 0) {
      const validatedData = faqUpdateValidation.parse(updateData);
      
      // Update the FAQ
      const updatedFAQ = await FAQ.findByIdAndUpdate(
        faqId,
        validatedData,
        { new: true }
      );

      res.json({
        success: true,
        statusCode: 200,
        message: "FAQ updated successfully",
        data: updatedFAQ,
      });
      return;
    }

    // If no updates provided
    res.json({
      success: true,
      statusCode: 200,
      message: "No changes to update",
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFAQById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const faq = await FAQ.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    
    if (!faq) {
      return next(new appError("FAQ not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "FAQ deleted successfully",
      data: faq,
    });
  } catch (error) {
    next(error);
  }
};

// Generate FAQ answer using AI
export const generateFAQAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return next(new appError("Question is required", 400));
    }
    
    const prompt = `Generate a helpful, concise answer for this FAQ question: "${question}". 
    The answer should be informative, friendly, and no more than 3-4 sentences.`;
    
    const generatedAnswer = await aiService.generateText(prompt);
    
    res.json({
      success: true,
      statusCode: 200,
      message: "Answer generated successfully",
      data: {
        question,
        answer: generatedAnswer
      },
    });
  } catch (error) {
    next(error);
  }
};