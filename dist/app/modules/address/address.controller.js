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
exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddressById = exports.getMyAddresses = void 0;
const address_model_1 = require("./address.model");
const address_validation_1 = require("./address.validation");
// Get all addresses for logged-in user
const getMyAddresses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Unauthorized",
            });
            return;
        }
        const addresses = yield address_model_1.Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
        res.json({
            success: true,
            statusCode: 200,
            message: "Addresses retrieved successfully",
            data: addresses,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message,
        });
    }
});
exports.getMyAddresses = getMyAddresses;
// Get single address by ID
const getAddressById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Unauthorized",
            });
            return;
        }
        const address = yield address_model_1.Address.findOne({ _id: id, userId });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message,
        });
    }
});
exports.getAddressById = getAddressById;
// Create new address
const createAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Unauthorized",
            });
            return;
        }
        const validatedData = address_validation_1.createAddressValidation.parse(req.body);
        // If this is set as default, unset other default addresses
        if (validatedData.isDefault) {
            yield address_model_1.Address.updateMany({ userId }, { isDefault: false });
        }
        const address = new address_model_1.Address(Object.assign(Object.assign({}, validatedData), { userId }));
        yield address.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Address created successfully",
            data: address,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message,
        });
    }
});
exports.createAddress = createAddress;
// Update address
const updateAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Unauthorized",
            });
            return;
        }
        const validatedData = address_validation_1.updateAddressValidation.parse(req.body);
        // If setting as default, unset other default addresses
        if (validatedData.isDefault) {
            yield address_model_1.Address.updateMany({ userId, _id: { $ne: id } }, { isDefault: false });
        }
        const address = yield address_model_1.Address.findOneAndUpdate({ _id: id, userId }, validatedData, { new: true });
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
    }
    catch (error) {
        res.status(400).json({
            success: false,
            statusCode: 400,
            message: error.message,
        });
    }
});
exports.updateAddress = updateAddress;
// Delete address
const deleteAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Unauthorized",
            });
            return;
        }
        const address = yield address_model_1.Address.findOneAndDelete({ _id: id, userId });
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
            const nextAddress = yield address_model_1.Address.findOne({ userId }).sort({ createdAt: -1 });
            if (nextAddress) {
                nextAddress.isDefault = true;
                yield nextAddress.save();
            }
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Address deleted successfully",
            data: address,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message,
        });
    }
});
exports.deleteAddress = deleteAddress;
// Set address as default
const setDefaultAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        yield address_model_1.Address.updateMany({ userId }, { isDefault: false });
        // Set the specified address as default
        const address = yield address_model_1.Address.findOneAndUpdate({ _id: id, userId }, { isDefault: true }, { new: true });
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: error.message,
        });
    }
});
exports.setDefaultAddress = setDefaultAddress;
