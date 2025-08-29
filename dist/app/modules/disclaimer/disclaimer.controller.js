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
exports.updateDisclaimer = exports.getDisclaimer = void 0;
const disclaimer_model_1 = require("./disclaimer.model");
const disclaimer_validation_1 = require("./disclaimer.validation");
const getDisclaimer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let disclaimer = yield disclaimer_model_1.Disclaimer.findOne();
        if (!disclaimer) {
            disclaimer = yield disclaimer_model_1.Disclaimer.create({
                content: '<p>Disclaimer content goes here.</p>'
            });
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Disclaimer retrieved successfully",
            data: disclaimer,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getDisclaimer = getDisclaimer;
const updateDisclaimer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const validatedData = disclaimer_validation_1.disclaimerValidation.parse({ content });
        let disclaimer = yield disclaimer_model_1.Disclaimer.findOne();
        if (!disclaimer) {
            disclaimer = new disclaimer_model_1.Disclaimer(validatedData);
            yield disclaimer.save();
        }
        else {
            disclaimer.content = content;
            yield disclaimer.save();
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Disclaimer updated successfully",
            data: disclaimer,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updateDisclaimer = updateDisclaimer;
