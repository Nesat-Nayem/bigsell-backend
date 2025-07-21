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
exports.deleteProgress = exports.updateProgress = exports.getAllProgress = exports.getProgressById = exports.createProgress = void 0;
const progress_model_1 = require("./progress.model");
const progress_validation_1 = require("./progress.validation");
const appError_1 = require("../../errors/appError");
const createProgress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, images, isDeleted } = progress_validation_1.progressValidation.parse(req.body);
        const progress = new progress_model_1.Progress({
            title,
            images,
            isDeleted,
        });
        yield progress.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Progress created successfully",
            data: progress,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createProgress = createProgress;
const getProgressById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const progress = yield progress_model_1.Progress.findById(req.params.id);
        if (!progress) {
            return next(new appError_1.appError("Progress not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Progress retrieved successfully",
            data: progress,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getProgressById = getProgressById;
const getAllProgress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const progress = yield progress_model_1.Progress.find({ isDeleted: false });
        if (progress.length === 0) {
            return next(new appError_1.appError("No progress records found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Progress records retrieved successfully",
            data: progress,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllProgress = getAllProgress;
const updateProgress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateFields = req.body;
        const progress = yield progress_model_1.Progress.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });
        if (!progress) {
            return next(new appError_1.appError("Progress not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Progress updated successfully",
            data: progress,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProgress = updateProgress;
const deleteProgress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const progress = yield progress_model_1.Progress.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!progress) {
            return next(new appError_1.appError("Progress not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Progress deleted successfully",
            data: progress,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteProgress = deleteProgress;
