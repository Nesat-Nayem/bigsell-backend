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
exports.deleteWithId = exports.updateWithId = exports.getAllServices = exports.getServiceWithId = exports.createService = void 0;
const service_model_1 = require("./service.model");
const service_validation_1 = require("./service.validation");
const appError_1 = require("../../errors/appError");
const createService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    {
        try {
            const { name, description, price, img, isDeleted } = service_validation_1.serviceValidation.parse(req.body);
            const service = new service_model_1.Service({
                name,
                description,
                price,
                img,
                isDeleted,
            });
            yield service.save();
            res.status(201).json({
                success: true,
                statusCode: 200,
                message: "Service created successfully",
                data: service,
            });
        }
        catch (error) {
            next(error);
        }
    }
});
exports.createService = createService;
const getServiceWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service = yield service_model_1.Service.findById(req.params.id);
        if (!service) {
            return next(new appError_1.appError("Service not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Service retrieved successfully",
            data: service,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getServiceWithId = getServiceWithId;
const getAllServices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield service_model_1.Service.find({ isDeleted: false });
        if (services.length === 0) {
            return next(new appError_1.appError("No data found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Services retrieved successfully",
            data: services,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllServices = getAllServices;
const updateWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateFields = req.body;
        const service = yield service_model_1.Service.findByIdAndUpdate(req.params.id, {
            $set: updateFields,
        }, { new: true });
        if (!service) {
            return next(new appError_1.appError("Service not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Service updated successfully",
            data: service,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateWithId = updateWithId;
const deleteWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service = yield service_model_1.Service.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!service) {
            return next(new appError_1.appError("Service not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Service deleted successfully",
            data: service,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteWithId = deleteWithId;
