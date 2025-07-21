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
exports.updatePrivacyPolicy = exports.getPrivacyPolicy = void 0;
const privacy_policy_model_1 = require("./privacy-policy.model");
const privacy_policy_validation_1 = require("./privacy-policy.validation");
const getPrivacyPolicy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the privacy policy or create a default one if it doesn't exist
        let privacyPolicy = yield privacy_policy_model_1.PrivacyPolicy.findOne();
        if (!privacyPolicy) {
            privacyPolicy = yield privacy_policy_model_1.PrivacyPolicy.create({
                content: '<p>Privacy Policy content goes here.</p>'
            });
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Privacy policy retrieved successfully",
            data: privacyPolicy,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getPrivacyPolicy = getPrivacyPolicy;
const updatePrivacyPolicy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        // Validate the input
        const validatedData = privacy_policy_validation_1.privacyPolicyValidation.parse({ content });
        // Find the privacy policy or create a new one if it doesn't exist
        let privacyPolicy = yield privacy_policy_model_1.PrivacyPolicy.findOne();
        if (!privacyPolicy) {
            privacyPolicy = new privacy_policy_model_1.PrivacyPolicy(validatedData);
            yield privacyPolicy.save();
        }
        else {
            // Update the existing privacy policy
            privacyPolicy.content = content;
            yield privacyPolicy.save();
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Privacy policy updated successfully",
            data: privacyPolicy,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updatePrivacyPolicy = updatePrivacyPolicy;
