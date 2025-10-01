import { RequestHandler } from "express";
import { Address } from "./address.model";
import { createAddressValidation, updateAddressValidation } from "./address.validation";

// Get all addresses for logged-in user
export const getMyAddresses: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
      return;
    }

    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

    res.json({
      success: true,
      statusCode: 200,
      message: "Addresses retrieved successfully",
      data: addresses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};

// Get single address by ID
export const getAddressById: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
      return;
    }

    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Address not found",
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Address retrieved successfully",
      data: address,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};

// Create new address
export const createAddress: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
      return;
    }

    const validatedData = createAddressValidation.parse(req.body);

    // If this is set as default, unset other default addresses
    if (validatedData.isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const address = new Address({
      ...validatedData,
      userId,
    });

    await address.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Address created successfully",
      data: address,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message,
    });
  }
};

// Update address
export const updateAddress: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
      return;
    }

    const validatedData = updateAddressValidation.parse(req.body);

    // If setting as default, unset other default addresses
    if (validatedData.isDefault) {
      await Address.updateMany({ userId, _id: { $ne: id } }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: id, userId },
      validatedData,
      { new: true }
    );

    if (!address) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Address not found",
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error.message,
    });
  }
};

// Delete address
export const deleteAddress: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
      return;
    }

    const address = await Address.findOneAndDelete({ _id: id, userId });

    if (!address) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Address not found",
      });
      return;
    }

    // If deleted address was default, make another address default if exists
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ userId }).sort({ createdAt: -1 });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Address deleted successfully",
      data: address,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};

// Set address as default
export const setDefaultAddress: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
      return;
    }

    // Unset all default addresses for this user
    await Address.updateMany({ userId }, { isDefault: false });

    // Set the specified address as default
    const address = await Address.findOneAndUpdate(
      { _id: id, userId },
      { isDefault: true },
      { new: true }
    );

    if (!address) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Address not found",
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Default address updated successfully",
      data: address,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error.message,
    });
  }
};
