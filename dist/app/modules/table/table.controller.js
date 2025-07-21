"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTableById = exports.updateTableById = exports.getTableById = exports.getAllTables = exports.createTable = void 0;
const table_model_1 = require("./table.model");
const table_validation_1 = require("./table.validation");
const appError_1 = require("../../errors/appError");
const createTable = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tableNumber, isActive, description } = req.body;
        // Check if a table with this number already exists
        const existingTable = yield table_model_1.Table.findOne({
            tableNumber: Number(tableNumber),
            isDeleted: false
        });
        if (existingTable) {
            next(new appError_1.appError("Table with this number already exists", 400));
            return;
        }
        // Validate the input
        const validatedData = table_validation_1.tableValidation.parse({
            tableNumber: Number(tableNumber),
            isActive: isActive === 'true' || isActive === true,
            description
        });
        // Create a new table entry
        const table = new table_model_1.Table(validatedData);
        yield table.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Table created successfully",
            data: table,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.createTable = createTable;
const getAllTables = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get only active tables if requested
        const { active } = req.query;
        const filter = { isDeleted: false };
        if (active === 'true') {
            filter.isActive = true;
        }
        const tables = yield table_model_1.Table.find(filter).sort({ tableNumber: 1 });
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
    }
    catch (error) {
        next(error);
    }
});
exports.getAllTables = getAllTables;
const getTableById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const table = yield table_model_1.Table.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!table) {
            next(new appError_1.appError("Table not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Table retrieved successfully",
            data: table,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getTableById = getTableById;
const updateTableById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tableId = req.params.id;
        const { tableNumber, isActive, description } = req.body;
        // Find the table to update
        const table = yield table_model_1.Table.findOne({
            _id: tableId,
            isDeleted: false
        });
        if (!table) {
            next(new appError_1.appError("Table not found", 404));
            return;
        }
        // Prepare update data
        const updateData = {};
        if (description !== undefined) {
            updateData.description = description;
        }
        if (isActive !== undefined) {
            updateData.isActive = isActive === 'true' || isActive === true;
        }
        // If table number is changing, check for duplicates
        if (tableNumber !== undefined && Number(tableNumber) !== table.tableNumber) {
            // Check if the new table number is already in use
            const existingTable = yield table_model_1.Table.findOne({
                tableNumber: Number(tableNumber),
                isDeleted: false,
                _id: { $ne: tableId }
            });
            if (existingTable) {
                next(new appError_1.appError("Table with this number already exists", 400));
                return;
            }
            updateData.tableNumber = Number(tableNumber);
        }
        // Validate the update data
        if (Object.keys(updateData).length > 0) {
            const validatedData = table_validation_1.tableUpdateValidation.parse(updateData);
            // Update the table
            const updatedTable = yield table_model_1.Table.findByIdAndUpdate(tableId, validatedData, { new: true });
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
    }
    catch (error) {
        next(error);
    }
});
exports.updateTableById = updateTableById;
const deleteTableById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const table = yield table_model_1.Table.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!table) {
            next(new appError_1.appError("Table not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Table deleted successfully",
            data: table,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteTableById = deleteTableById;
