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
exports.updateVendorPolicy = exports.getVendorPolicy = void 0;
const vendor_policy_model_1 = require("./vendor-policy.model");
const vendor_policy_validation_1 = require("./vendor-policy.validation");
const getVendorPolicy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let vendorPolicy = yield vendor_policy_model_1.VendorPolicy.findOne();
        if (!vendorPolicy) {
            vendorPolicy = yield vendor_policy_model_1.VendorPolicy.create({
                content: '<p>Vendor Policy content goes here.</p>'
            });
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Vendor policy retrieved successfully",
            data: vendorPolicy,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getVendorPolicy = getVendorPolicy;
const updateVendorPolicy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const validatedData = vendor_policy_validation_1.vendorPolicyValidation.parse({ content });
        let vendorPolicy = yield vendor_policy_model_1.VendorPolicy.findOne();
        if (!vendorPolicy) {
            vendorPolicy = new vendor_policy_model_1.VendorPolicy(validatedData);
            yield vendorPolicy.save();
        }
        else {
            vendorPolicy.content = content;
            yield vendorPolicy.save();
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Vendor policy updated successfully",
            data: vendorPolicy,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updateVendorPolicy = updateVendorPolicy;
