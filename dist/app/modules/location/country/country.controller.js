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
exports.deleteCountryWithId = exports.countryUpdateWithId = exports.getAllCountrys = exports.getCountryWithId = exports.createCountry = void 0;
const country_model_1 = require("./country.model");
const country_validation_1 = require("./country.validation");
const appError_1 = require("../../../errors/appError");
const createCountry = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    {
        try {
            const { name, isoCode, isDeleted } = country_validation_1.inqueryValidation.parse(req.body);
            const country = new country_model_1.Country({
                name,
                isoCode,
                isDeleted,
            });
            yield country.save();
            res.status(201).json({
                success: true,
                statusCode: 200,
                message: "Country created successfully",
                data: country,
            });
        }
        catch (error) {
            next(error);
        }
    }
});
exports.createCountry = createCountry;
const getCountryWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const country = yield country_model_1.Country.findById(req.params.id);
        if (!country) {
            return next(new appError_1.appError("Country not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Country retrieved successfully",
            data: country,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCountryWithId = getCountryWithId;
const getAllCountrys = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const country = yield country_model_1.Country.find({ isDeleted: false });
        if (country.length === 0) {
            return next(new appError_1.appError("No data found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Country retrieved successfully",
            data: country,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllCountrys = getAllCountrys;
const countryUpdateWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateFields = req.body;
        const country = yield country_model_1.Country.findByIdAndUpdate(req.params.id, {
            $set: updateFields,
        }, { new: true });
        if (!country) {
            return next(new appError_1.appError("Country not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Country updated successfully",
            data: country,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.countryUpdateWithId = countryUpdateWithId;
const deleteCountryWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const country = yield country_model_1.Country.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!country) {
            return next(new appError_1.appError("Country not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Country deleted successfully",
            data: country,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteCountryWithId = deleteCountryWithId;
