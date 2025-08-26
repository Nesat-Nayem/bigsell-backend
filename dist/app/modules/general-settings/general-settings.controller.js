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
exports.updateGeneralSettings = exports.getGeneralSettings = void 0;
const general_settings_model_1 = require("./general-settings.model");
const general_settings_validation_1 = require("./general-settings.validation");
const appError_1 = require("../../errors/appError");
const getGeneralSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let doc = yield general_settings_model_1.GeneralSettings.findOne();
        if (!doc) {
            doc = yield general_settings_model_1.GeneralSettings.create({});
        }
        res.json({ success: true, statusCode: 200, message: 'General settings retrieved successfully', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.getGeneralSettings = getGeneralSettings;
const updateGeneralSettings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const textPayload = general_settings_validation_1.generalSettingsUpdateValidation.parse(req.body);
        // Files: favicon, logo
        const files = req.files;
        if ((_b = (_a = files === null || files === void 0 ? void 0 : files.favicon) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.path) {
            textPayload.favicon = files.favicon[0].path;
        }
        if ((_d = (_c = files === null || files === void 0 ? void 0 : files.logo) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.path) {
            textPayload.logo = files.logo[0].path;
        }
        let doc = yield general_settings_model_1.GeneralSettings.findOne();
        if (!doc) {
            doc = yield general_settings_model_1.GeneralSettings.create(textPayload);
        }
        else {
            doc = (yield general_settings_model_1.GeneralSettings.findByIdAndUpdate(doc._id, textPayload, { new: true }));
        }
        if (!doc)
            return next(new appError_1.appError('Failed to update general settings', 400));
        res.json({ success: true, statusCode: 200, message: 'General settings updated successfully', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.updateGeneralSettings = updateGeneralSettings;
