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
exports.updateHelpSupport = exports.getHelpSupport = void 0;
const help_support_model_1 = require("./help-support.model");
const help_support_validation_1 = require("./help-support.validation");
const getHelpSupport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get the help and support content or create a default one if it doesn't exist
        let helpSupport = yield help_support_model_1.HelpSupport.findOne();
        if (!helpSupport) {
            helpSupport = yield help_support_model_1.HelpSupport.create({
                content: '<p>Help and Support content goes here.</p>'
            });
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Help and support content retrieved successfully",
            data: helpSupport,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getHelpSupport = getHelpSupport;
const updateHelpSupport = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        // Validate the input
        const validatedData = help_support_validation_1.helpSupportValidation.parse({ content });
        // Find the help and support content or create a new one if it doesn't exist
        let helpSupport = yield help_support_model_1.HelpSupport.findOne();
        if (!helpSupport) {
            helpSupport = new help_support_model_1.HelpSupport(validatedData);
            yield helpSupport.save();
        }
        else {
            // Update the existing help and support content
            helpSupport.content = content;
            yield helpSupport.save();
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Help and support content updated successfully",
            data: helpSupport,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updateHelpSupport = updateHelpSupport;
