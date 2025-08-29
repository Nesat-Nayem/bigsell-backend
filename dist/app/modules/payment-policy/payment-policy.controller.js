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
exports.updatePaymentPolicy = exports.getPaymentPolicy = void 0;
const payment_policy_model_1 = require("./payment-policy.model");
const payment_policy_validation_1 = require("./payment-policy.validation");
const getPaymentPolicy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let paymentPolicy = yield payment_policy_model_1.PaymentPolicy.findOne();
        if (!paymentPolicy) {
            paymentPolicy = yield payment_policy_model_1.PaymentPolicy.create({
                content: '<p>Payment Policy content goes here.</p>'
            });
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Payment policy retrieved successfully",
            data: paymentPolicy,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getPaymentPolicy = getPaymentPolicy;
const updatePaymentPolicy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const validatedData = payment_policy_validation_1.paymentPolicyValidation.parse({ content });
        let paymentPolicy = yield payment_policy_model_1.PaymentPolicy.findOne();
        if (!paymentPolicy) {
            paymentPolicy = new payment_policy_model_1.PaymentPolicy(validatedData);
            yield paymentPolicy.save();
        }
        else {
            paymentPolicy.content = content;
            yield paymentPolicy.save();
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Payment policy updated successfully",
            data: paymentPolicy,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updatePaymentPolicy = updatePaymentPolicy;
