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
exports.deletePricingPlanById = exports.updatePricingPlanById = exports.getPricingPlanById = exports.getAllPricingPlans = exports.createPricing = void 0;
const pricing_model_1 = require("./pricing.model");
const pricing_validation_1 = require("./pricing.validation");
const appError_1 = require("../../errors/appError");
const createPricing = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, price, description, features, color } = req.body;
        // Check if pricing with same title already exists
        const existingPricing = yield pricing_model_1.Pricing.findOne({ title, isDeleted: false });
        if (existingPricing) {
            next(new appError_1.appError("Pricing plan with this title already exists", 400));
            return;
        }
        // Validate the input
        const validatedData = pricing_validation_1.pricingValidation.parse({
            title,
            price,
            description,
            features: Array.isArray(features) ? features : JSON.parse(features),
            color
        });
        // Create a new pricing plan
        const pricing = new pricing_model_1.Pricing(validatedData);
        yield pricing.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Pricing plan created successfully",
            data: pricing,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.createPricing = createPricing;
const getAllPricingPlans = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pricingPlans = yield pricing_model_1.Pricing.find({ isDeleted: false }).sort({ createdAt: -1 });
        if (pricingPlans.length === 0) {
            next(new appError_1.appError("No pricing plans found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Pricing plans retrieved successfully",
            data: pricingPlans,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getAllPricingPlans = getAllPricingPlans;
const getPricingPlanById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pricingPlan = yield pricing_model_1.Pricing.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!pricingPlan) {
            next(new appError_1.appError("Pricing plan not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Pricing plan retrieved successfully",
            data: pricingPlan,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getPricingPlanById = getPricingPlanById;
const updatePricingPlanById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pricingId = req.params.id;
        // Find the pricing plan to update
        const pricingPlan = yield pricing_model_1.Pricing.findOne({
            _id: pricingId,
            isDeleted: false
        });
        if (!pricingPlan) {
            next(new appError_1.appError("Pricing plan not found", 404));
            return;
        }
        // Prepare update data
        const updateData = {};
        if (req.body.title) {
            // Check if new title already exists
            if (req.body.title !== pricingPlan.title) {
                const existingPricing = yield pricing_model_1.Pricing.findOne({
                    title: req.body.title,
                    isDeleted: false,
                    _id: { $ne: pricingId }
                });
                if (existingPricing) {
                    next(new appError_1.appError("Pricing plan with this title already exists", 400));
                    return;
                }
            }
            updateData.title = req.body.title;
        }
        if (req.body.price)
            updateData.price = req.body.price;
        if (req.body.description)
            updateData.description = req.body.description;
        if (req.body.color)
            updateData.color = req.body.color;
        if (req.body.features) {
            updateData.features = Array.isArray(req.body.features)
                ? req.body.features
                : JSON.parse(req.body.features);
        }
        // Validate the update data
        if (Object.keys(updateData).length > 0) {
            const validatedData = pricing_validation_1.pricingUpdateValidation.parse(updateData);
            // Update the pricing plan
            const updatedPricingPlan = yield pricing_model_1.Pricing.findByIdAndUpdate(pricingId, validatedData, { new: true });
            res.json({
                success: true,
                statusCode: 200,
                message: "Pricing plan updated successfully",
                data: updatedPricingPlan,
            });
            return;
        }
        // If no updates provided
        res.json({
            success: true,
            statusCode: 200,
            message: "No changes to update",
            data: pricingPlan,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updatePricingPlanById = updatePricingPlanById;
const deletePricingPlanById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pricingPlan = yield pricing_model_1.Pricing.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!pricingPlan) {
            next(new appError_1.appError("Pricing plan not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Pricing plan deleted successfully",
            data: pricingPlan,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.deletePricingPlanById = deletePricingPlanById;
