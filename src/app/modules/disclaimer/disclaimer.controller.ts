import { NextFunction, Request, Response } from "express";
import { Disclaimer } from "./disclaimer.model";
import { disclaimerValidation } from "./disclaimer.validation";

export const getDisclaimer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let disclaimer = await Disclaimer.findOne();

    if (!disclaimer) {
      disclaimer = await Disclaimer.create({
        content: '<p>Disclaimer content goes here.</p>'
      });
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Disclaimer retrieved successfully",
      data: disclaimer,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateDisclaimer = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content } = req.body;

    const validatedData = disclaimerValidation.parse({ content });

    let disclaimer = await Disclaimer.findOne();

    if (!disclaimer) {
      disclaimer = new Disclaimer(validatedData);
      await disclaimer.save();
    } else {
      disclaimer.content = content;
      await disclaimer.save();
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Disclaimer updated successfully",
      data: disclaimer,
    });
    return;
  } catch (error) {
    next(error);
  }
};
