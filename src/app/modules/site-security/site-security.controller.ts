import { NextFunction, Request, Response } from "express";
import { SiteSecurity } from "./site-security.model";
import { siteSecurityValidation } from "./site-security.validation";

export const getSiteSecurity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let siteSecurity = await SiteSecurity.findOne();

    if (!siteSecurity) {
      siteSecurity = await SiteSecurity.create({
        content: '<p>Site Security content goes here.</p>'
      });
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Site security retrieved successfully",
      data: siteSecurity,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateSiteSecurity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content } = req.body;

    const validatedData = siteSecurityValidation.parse({ content });

    let siteSecurity = await SiteSecurity.findOne();

    if (!siteSecurity) {
      siteSecurity = new SiteSecurity(validatedData);
      await siteSecurity.save();
    } else {
      siteSecurity.content = content;
      await siteSecurity.save();
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Site security updated successfully",
      data: siteSecurity,
    });
    return;
  } catch (error) {
    next(error);
  }
};
