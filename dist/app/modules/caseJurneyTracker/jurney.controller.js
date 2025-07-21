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
exports.deleteJurney = exports.updateJurney = exports.getAllJurneys = exports.getJurneyById = exports.createJurney = void 0;
const jurney_model_1 = require("./jurney.model");
const jurney_validation_1 = require("./jurney.validation");
const appError_1 = require("../../errors/appError");
const createJurney = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, imageUrl, isDeleted } = jurney_validation_1.jurneyValidation.parse(req.body);
        const jurney = new jurney_model_1.Jurney({
            title,
            imageUrl,
            isDeleted,
        });
        yield jurney.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Journey created successfully",
            data: jurney,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createJurney = createJurney;
const getJurneyById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jurney = yield jurney_model_1.Jurney.findById(req.params.id);
        if (!jurney) {
            return next(new appError_1.appError("Journey not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Journey retrieved successfully",
            data: jurney,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getJurneyById = getJurneyById;
const getAllJurneys = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jurneys = yield jurney_model_1.Jurney.find({ isDeleted: false });
        if (jurneys.length === 0) {
            return next(new appError_1.appError("No journeys found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Journeys retrieved successfully",
            data: jurneys,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllJurneys = getAllJurneys;
const updateJurney = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateFields = req.body;
        const jurney = yield jurney_model_1.Jurney.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });
        if (!jurney) {
            return next(new appError_1.appError("Journey not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Journey updated successfully",
            data: jurney,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateJurney = updateJurney;
const deleteJurney = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jurney = yield jurney_model_1.Jurney.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!jurney) {
            return next(new appError_1.appError("Journey not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Journey deleted successfully",
            data: jurney,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteJurney = deleteJurney;
