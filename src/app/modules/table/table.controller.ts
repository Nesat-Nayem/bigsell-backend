import { NextFunction, Request, Response } from "express";
import { Table } from "./table.model";
import { tableValidation, tableUpdateValidation } from "./table.validation";
import { appError } from "../../errors/appError";

export const createTable = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tableNumber, isActive, description } = req.body;
    
    // Check if a table with this number already exists
    const existingTable = await Table.findOne({ 
      tableNumber: Number(tableNumber), 
      isDeleted: false 
    });
    
    if (existingTable) {
      next(new appError("Table with this number already exists", 400));
      return;
    }
    
    // Validate the input
    const validatedData = tableValidation.parse({ 
      tableNumber: Number(tableNumber), 
      isActive: isActive === 'true' || isActive === true,
      description
    });

    // Create a new table entry
    const table = new Table(validatedData);
    await table.save();

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Table created successfully",
      data: table,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getAllTables = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get only active tables if requested
    const { active } = req.query;
    const filter: any = { isDeleted: false };
    
    if (active === 'true') {
      filter.isActive = true;
    }
    
    const tables = await Table.find(filter).sort({ tableNumber: 1 });
    
    if (tables.length === 0) {
      res.json({
        success: true,
        statusCode: 200,
        message: "No tables found",
        data: [],
      });
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Tables retrieved successfully",
      data: tables,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const getTableById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const table = await Table.findOne({ 
      _id: req.params.id, 
      isDeleted: false 
    });
    
    if (!table) {
      next(new appError("Table not found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Table retrieved successfully",
      data: table,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const updateTableById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tableId = req.params.id;
    const { tableNumber, isActive, description } = req.body;
    
    // Find the table to update
    const table = await Table.findOne({ 
      _id: tableId, 
      isDeleted: false 
    });
    
    if (!table) {
      next(new appError("Table not found", 404));
      return;
    }

    // Prepare update data
    const updateData: any = {};
    
    if (description !== undefined) {
      updateData.description = description;
    }
    
    if (isActive !== undefined) {
      updateData.isActive = isActive === 'true' || isActive === true;
    }
    
    // If table number is changing, check for duplicates
    if (tableNumber !== undefined && Number(tableNumber) !== table.tableNumber) {
      // Check if the new table number is already in use
      const existingTable = await Table.findOne({ 
        tableNumber: Number(tableNumber), 
        isDeleted: false,
        _id: { $ne: tableId }
      });
      
      if (existingTable) {
        next(new appError("Table with this number already exists", 400));
        return;
      }
      
      updateData.tableNumber = Number(tableNumber);
    }

    // Validate the update data
    if (Object.keys(updateData).length > 0) {
      const validatedData = tableUpdateValidation.parse(updateData);
      
      // Update the table
      const updatedTable = await Table.findByIdAndUpdate(
        tableId,
        validatedData,
        { new: true }
      );

      res.json({
        success: true,
        statusCode: 200,
        message: "Table updated successfully",
        data: updatedTable,
      });
      return;
    }

    // If no updates provided
    res.json({
      success: true,
      statusCode: 200,
      message: "No changes to update",
      data: table,
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteTableById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const table = await Table.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    
    if (!table) {
      next(new appError("Table not found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Table deleted successfully",
      data: table,
    });
    return;
  } catch (error) {
    next(error);
  }
};
