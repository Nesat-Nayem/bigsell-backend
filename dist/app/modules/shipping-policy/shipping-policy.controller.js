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
exports.updateShippingPolicy = exports.getShippingPolicy = void 0;
const shipping_policy_model_1 = require("./shipping-policy.model");
const shipping_policy_validation_1 = require("./shipping-policy.validation");
const getShippingPolicy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let shippingPolicy = yield shipping_policy_model_1.ShippingPolicy.findOne();
        if (!shippingPolicy) {
            shippingPolicy = yield shipping_policy_model_1.ShippingPolicy.create({
                content: '<p>Shipping Policy content goes here.</p>'
            });
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Shipping policy retrieved successfully",
            data: shippingPolicy,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getShippingPolicy = getShippingPolicy;
const updateShippingPolicy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const validatedData = shipping_policy_validation_1.shippingPolicyValidation.parse({ content });
        let shippingPolicy = yield shipping_policy_model_1.ShippingPolicy.findOne();
        if (!shippingPolicy) {
            shippingPolicy = new shipping_policy_model_1.ShippingPolicy(validatedData);
            yield shippingPolicy.save();
        }
        else {
            shippingPolicy.content = content;
            yield shippingPolicy.save();
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Shipping policy updated successfully",
            data: shippingPolicy,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updateShippingPolicy = updateShippingPolicy;
