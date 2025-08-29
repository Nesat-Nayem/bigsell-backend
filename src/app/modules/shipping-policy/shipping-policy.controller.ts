import { NextFunction, Request, Response } from "express";
import { ShippingPolicy } from "./shipping-policy.model";
import { shippingPolicyValidation } from "./shipping-policy.validation";

export const getShippingPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let shippingPolicy = await ShippingPolicy.findOne();

    if (!shippingPolicy) {
      shippingPolicy = await ShippingPolicy.create({
        content: '<p>Shipping Policy content goes here.</p>'
      });
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Shipping policy retrieved successfully",
      data: shippingPolicy,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateShippingPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content } = req.body;

    const validatedData = shippingPolicyValidation.parse({ content });

    let shippingPolicy = await ShippingPolicy.findOne();

    if (!shippingPolicy) {
      shippingPolicy = new ShippingPolicy(validatedData);
      await shippingPolicy.save();
    } else {
      shippingPolicy.content = content;
      await shippingPolicy.save();
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Shipping policy updated successfully",
      data: shippingPolicy,
    });
    return;
  } catch (error) {
    next(error);
  }
};
