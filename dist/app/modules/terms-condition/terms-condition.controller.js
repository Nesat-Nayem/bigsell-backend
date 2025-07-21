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
exports.updateTermsCondition = exports.getTermsCondition = void 0;
const terms_condition_model_1 = require("./terms-condition.model");
const terms_condition_validation_1 = require("./terms-condition.validation");
const getTermsCondition = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the privacy policy or create a default one if it doesn't exist
        let termsCondition = yield terms_condition_model_1.TermsCondition.findOne();
        if (!termsCondition) {
            termsCondition = yield terms_condition_model_1.TermsCondition.create({
                content: '<p> Terms and Conditions content goes here.</p>'
            });
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Terms and Conditions retrieved successfully",
            data: termsCondition,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getTermsCondition = getTermsCondition;
const updateTermsCondition = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        // Validate the input
        const validatedData = terms_condition_validation_1.TermsConditionValidation.parse({ content });
        // Find the privacy policy or create a new one if it doesn't exist
        let termsCondition = yield terms_condition_model_1.TermsCondition.findOne();
        if (!termsCondition) {
            termsCondition = new terms_condition_model_1.TermsCondition(validatedData);
            yield termsCondition.save();
        }
        else {
            // Update the existing privacy policy
            termsCondition.content = content;
            yield termsCondition.save();
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Privacy policy updated successfully",
            data: termsCondition,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updateTermsCondition = updateTermsCondition;
