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
exports.deleteCityWithId = exports.cityUpdateWithId = exports.getAllCitys = exports.getCityWithId = exports.createCity = void 0;
const city_model_1 = require("./city.model");
const city_validation_1 = require("./city.validation");
const appError_1 = require("../../../errors/appError");
const createCity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    {
        try {
            const { name, isDeleted } = city_validation_1.cityValidation.parse(req.body);
            const city = new city_model_1.City({
                name,
                isDeleted,
            });
            yield city.save();
            res.status(201).json({
                success: true,
                statusCode: 200,
                message: "City created successfully",
                data: city,
            });
        }
        catch (error) {
            next(error);
        }
    }
});
exports.createCity = createCity;
const getCityWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const city = yield city_model_1.City.findById(req.params.id);
        if (!city) {
            return next(new appError_1.appError("City not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "City retrieved successfully",
            data: city,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCityWithId = getCityWithId;
const getAllCitys = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const city = yield city_model_1.City.find({ isDeleted: false });
        if (city.length === 0) {
            return next(new appError_1.appError("No data found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "City retrieved successfully",
            data: city,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllCitys = getAllCitys;
const cityUpdateWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateFields = req.body;
        const city = yield city_model_1.City.findByIdAndUpdate(req.params.id, {
            $set: updateFields,
        }, { new: true });
        if (!city) {
            return next(new appError_1.appError("City not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "City updated successfully",
            data: city,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.cityUpdateWithId = cityUpdateWithId;
const deleteCityWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const city = yield city_model_1.City.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!city) {
            return next(new appError_1.appError("City not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "City deleted successfully",
            data: city,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteCityWithId = deleteCityWithId;
