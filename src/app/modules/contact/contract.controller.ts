import { NextFunction, Request, Response } from "express";
import { Contract } from "./contract.model";
import { contractValidation, contractUpdateValidation } from "./contract.validation";
import { appError } from "../../errors/appError";

export const createContract = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, brandName, phoneNumber, emailAddress, message } = req.body;
    
    // Validate the input
    const validatedData = contractValidation.parse({ 
      name, 
      brandName, 
      phoneNumber, 
      emailAddress, 
      message
    });

    // Create a new contract
    const contract = new Contract(validatedData);
    await contract.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Contact message submitted successfully",
      data: contract,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllContracts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Filter by status if requested
    const { status } = req.query;
    const filter: any = { isDeleted: false };
    
    if (status && ['pending', 'approved', 'rejected'].includes(status as string)) {
      filter.status = status;
    }
    
    const contracts = await Contract.find(filter).sort({ createdAt: -1 });
    
    if (contracts.length === 0) {
      res.json({
        success: true,
        statusCode: 200,
        message: "No contacts found",
        data: [],
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Contacts retrieved successfully",
      data: contracts,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getContractById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contract = await Contract.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!contract) {
      return next(new appError("Contact not found", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Contact retrieved successfully",
      data: contract,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateContractById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contractId = req.params.id;
    const { name, brandName, phoneNumber, emailAddress, message, status } = req.body;
    
    // Find the contract to update
    const contract = await Contract.findOne({ 
      _id: contractId, 
      isDeleted: false 
    });
    
    if (!contract) {
      next(new appError("Contact not found", 404));
      return;
    }

    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (brandName !== undefined) updateData.brandName = brandName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (emailAddress !== undefined) updateData.emailAddress = emailAddress;
    if (message !== undefined) updateData.message = message;
    if (status !== undefined) updateData.status = status;

    // Validate the update data
    if (Object.keys(updateData).length > 0) {
      const validatedData = contractUpdateValidation.parse(updateData);
      
      // Update the contract
      const updatedContract = await Contract.findByIdAndUpdate(
        contractId,
        validatedData,
        { new: true }
      );

      res.json({
        success: true,
        statusCode: 200,
        message: "Contact updated successfully",
        data: updatedContract,
      });
      return;
    }

    // If no updates provided
    res.json({
      success: true,
      statusCode: 200,
      message: "No changes to update",
      data: contract,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteContractById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contract = await Contract.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    
    if (!contract) {
      next(new appError("Contact not found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Contact deleted successfully",
      data: contract,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateContractStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contractId = req.params.id;
    const { status } = req.body;
    
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      next(new appError("Invalid status value", 400));
      return;
    }
    
    const contract = await Contract.findOneAndUpdate(
      { _id: contractId, isDeleted: false },
      { status },
      { new: true }
    );
    
    if (!contract) {
      next(new appError("Contact not found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: `Contact status updated to ${status}`,
      data: contract,
    });
    return;
  } catch (error) {
    next(error);
  }
};
