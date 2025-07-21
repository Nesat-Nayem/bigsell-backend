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
exports.updateContractStatus = exports.deleteContractById = exports.updateContractById = exports.getContractById = exports.getAllContracts = exports.createContract = void 0;
const contract_model_1 = require("./contract.model");
const contract_validation_1 = require("./contract.validation");
const appError_1 = require("../../errors/appError");
const createContract = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, brandName, phoneNumber, emailAddress, message } = req.body;
        // Validate the input
        const validatedData = contract_validation_1.contractValidation.parse({
            name,
            brandName,
            phoneNumber,
            emailAddress,
            message
        });
        // Create a new contract
        const contract = new contract_model_1.Contract(validatedData);
        yield contract.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Contact message submitted successfully",
            data: contract,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.createContract = createContract;
const getAllContracts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Filter by status if requested
        const { status } = req.query;
        const filter = { isDeleted: false };
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            filter.status = status;
        }
        const contracts = yield contract_model_1.Contract.find(filter).sort({ createdAt: -1 });
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
    }
    catch (error) {
        next(error);
    }
});
exports.getAllContracts = getAllContracts;
const getContractById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contract = yield contract_model_1.Contract.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!contract) {
            return next(new appError_1.appError("Contact not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Contact retrieved successfully",
            data: contract,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getContractById = getContractById;
const updateContractById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contractId = req.params.id;
        const { name, brandName, phoneNumber, emailAddress, message, status } = req.body;
        // Find the contract to update
        const contract = yield contract_model_1.Contract.findOne({
            _id: contractId,
            isDeleted: false
        });
        if (!contract) {
            next(new appError_1.appError("Contact not found", 404));
            return;
        }
        // Prepare update data
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (brandName !== undefined)
            updateData.brandName = brandName;
        if (phoneNumber !== undefined)
            updateData.phoneNumber = phoneNumber;
        if (emailAddress !== undefined)
            updateData.emailAddress = emailAddress;
        if (message !== undefined)
            updateData.message = message;
        if (status !== undefined)
            updateData.status = status;
        // Validate the update data
        if (Object.keys(updateData).length > 0) {
            const validatedData = contract_validation_1.contractUpdateValidation.parse(updateData);
            // Update the contract
            const updatedContract = yield contract_model_1.Contract.findByIdAndUpdate(contractId, validatedData, { new: true });
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
    }
    catch (error) {
        next(error);
    }
});
exports.updateContractById = updateContractById;
const deleteContractById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contract = yield contract_model_1.Contract.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!contract) {
            next(new appError_1.appError("Contact not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Contact deleted successfully",
            data: contract,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deleteContractById = deleteContractById;
const updateContractStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contractId = req.params.id;
        const { status } = req.body;
        if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
            next(new appError_1.appError("Invalid status value", 400));
            return;
        }
        const contract = yield contract_model_1.Contract.findOneAndUpdate({ _id: contractId, isDeleted: false }, { status }, { new: true });
        if (!contract) {
            next(new appError_1.appError("Contact not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: `Contact status updated to ${status}`,
            data: contract,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updateContractStatus = updateContractStatus;
