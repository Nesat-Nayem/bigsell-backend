import { NextFunction, Request, Response } from "express";
import { VendorPolicy } from "./vendor-policy.model";
import { vendorPolicyValidation } from "./vendor-policy.validation";

export const getVendorPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let vendorPolicy = await VendorPolicy.findOne();

    if (!vendorPolicy) {
      vendorPolicy = await VendorPolicy.create({
        content: '<p>Vendor Policy content goes here.</p>'
      });
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Vendor policy retrieved successfully",
      data: vendorPolicy,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateVendorPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content } = req.body;

    const validatedData = vendorPolicyValidation.parse({ content });

    let vendorPolicy = await VendorPolicy.findOne();

    if (!vendorPolicy) {
      vendorPolicy = new VendorPolicy(validatedData);
      await vendorPolicy.save();
    } else {
      vendorPolicy.content = content;
      await vendorPolicy.save();
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Vendor policy updated successfully",
      data: vendorPolicy,
    });
    return;
  } catch (error) {
    next(error);
  }
};
