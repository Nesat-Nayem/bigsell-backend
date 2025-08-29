import { NextFunction, Request, Response } from "express";
import { PaymentPolicy } from "./payment-policy.model";
import { paymentPolicyValidation } from "./payment-policy.validation";

export const getPaymentPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let paymentPolicy = await PaymentPolicy.findOne();

    if (!paymentPolicy) {
      paymentPolicy = await PaymentPolicy.create({
        content: '<p>Payment Policy content goes here.</p>'
      });
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Payment policy retrieved successfully",
      data: paymentPolicy,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updatePaymentPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content } = req.body;

    const validatedData = paymentPolicyValidation.parse({ content });

    let paymentPolicy = await PaymentPolicy.findOne();

    if (!paymentPolicy) {
      paymentPolicy = new PaymentPolicy(validatedData);
      await paymentPolicy.save();
    } else {
      paymentPolicy.content = content;
      await paymentPolicy.save();
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Payment policy updated successfully",
      data: paymentPolicy,
    });
    return;
  } catch (error) {
    next(error);
  }
};
