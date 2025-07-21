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
exports.deleteLegislative = exports.updateLegislative = exports.getAllLegislatives = exports.getLegislativeById = exports.createLegislative = void 0;
const legislative_model_1 = require("./legislative.model");
const legislative_validation_1 = require("./legislative.validation");
const appError_1 = require("../../errors/appError");
const createLegislative = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = legislative_validation_1.legislativeValidation.parse(req.body);
        const legislative = new legislative_model_1.Legislative(validatedData);
        yield legislative.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Legislative created successfully",
            data: legislative,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createLegislative = createLegislative;
const getLegislativeById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const legislative = yield legislative_model_1.Legislative.findById(req.params.id);
        if (!legislative) {
            return next(new appError_1.appError("Legislative not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Legislative retrieved successfully",
            data: legislative,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getLegislativeById = getLegislativeById;
const getAllLegislatives = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const legislatives = yield legislative_model_1.Legislative.find({ isDeleted: false });
        if (legislatives.length === 0) {
            return next(new appError_1.appError("No legislatives found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Legislatives retrieved successfully",
            data: legislatives,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllLegislatives = getAllLegislatives;
const updateLegislative = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const legislative = yield legislative_model_1.Legislative.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!legislative) {
            return next(new appError_1.appError("Legislative not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Legislative updated successfully",
            data: legislative,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateLegislative = updateLegislative;
const deleteLegislative = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const legislative = yield legislative_model_1.Legislative.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!legislative) {
            return next(new appError_1.appError("Legislative not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Legislative deleted successfully",
            data: legislative,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteLegislative = deleteLegislative;
