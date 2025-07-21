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
exports.deleteStateWithId = exports.stateUpdateWithId = exports.getAllStates = exports.getStateWithId = exports.createState = void 0;
const state_model_1 = require("./state.model");
const state_validation_1 = require("./state.validation");
const appError_1 = require("../../../errors/appError");
const createState = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    {
        try {
            const { name, isDeleted } = state_validation_1.stateValidation.parse(req.body);
            const state = new state_model_1.State({
                name,
                isDeleted,
            });
            yield state.save();
            res.status(201).json({
                success: true,
                statusCode: 200,
                message: "State created successfully",
                data: state,
            });
        }
        catch (error) {
            next(error);
        }
    }
});
exports.createState = createState;
const getStateWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const state = yield state_model_1.State.findById(req.params.id);
        if (!state) {
            return next(new appError_1.appError("State not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "State retrieved successfully",
            data: state,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getStateWithId = getStateWithId;
const getAllStates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const state = yield state_model_1.State.find({ isDeleted: false });
        if (state.length === 0) {
            return next(new appError_1.appError("No data found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "State retrieved successfully",
            data: state,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllStates = getAllStates;
const stateUpdateWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateFields = req.body;
        const state = yield state_model_1.State.findByIdAndUpdate(req.params.id, {
            $set: updateFields,
        }, { new: true });
        if (!state) {
            return next(new appError_1.appError("State not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "State updated successfully",
            data: state,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.stateUpdateWithId = stateUpdateWithId;
const deleteStateWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const state = yield state_model_1.State.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!state) {
            return next(new appError_1.appError("State not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "State deleted successfully",
            data: state,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteStateWithId = deleteStateWithId;
