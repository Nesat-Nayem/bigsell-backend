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
exports.updateSiteSecurity = exports.getSiteSecurity = void 0;
const site_security_model_1 = require("./site-security.model");
const site_security_validation_1 = require("./site-security.validation");
const getSiteSecurity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let siteSecurity = yield site_security_model_1.SiteSecurity.findOne();
        if (!siteSecurity) {
            siteSecurity = yield site_security_model_1.SiteSecurity.create({
                content: '<p>Site Security content goes here.</p>'
            });
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Site security retrieved successfully",
            data: siteSecurity,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.getSiteSecurity = getSiteSecurity;
const updateSiteSecurity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const validatedData = site_security_validation_1.siteSecurityValidation.parse({ content });
        let siteSecurity = yield site_security_model_1.SiteSecurity.findOne();
        if (!siteSecurity) {
            siteSecurity = new site_security_model_1.SiteSecurity(validatedData);
            yield siteSecurity.save();
        }
        else {
            siteSecurity.content = content;
            yield siteSecurity.save();
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Site security updated successfully",
            data: siteSecurity,
        });
        return;
    }
    catch (error) {
        next(error);
    }
});
exports.updateSiteSecurity = updateSiteSecurity;
