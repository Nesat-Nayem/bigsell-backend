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
exports.deleteFooterWidgetById = exports.updateFooterWidgetById = exports.getFooterWidgetById = exports.getAllFooterWidgets = exports.createFooterWidget = void 0;
const footer_widget_model_1 = require("./footer-widget.model");
const footer_widget_validation_1 = require("./footer-widget.validation");
const appError_1 = require("../../errors/appError");
const createFooterWidget = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validated = footer_widget_validation_1.footerWidgetCreateValidation.parse(req.body);
        const doc = yield footer_widget_model_1.FooterWidget.create(validated);
        res.status(201).json({ success: true, statusCode: 201, message: 'Footer widget created successfully', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.createFooterWidget = createFooterWidget;
const getAllFooterWidgets = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const docs = yield footer_widget_model_1.FooterWidget.find({ isDeleted: false }).sort({ createdAt: -1 });
        res.json({ success: true, statusCode: 200, message: 'Footer widgets retrieved successfully', data: docs });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllFooterWidgets = getAllFooterWidgets;
const getFooterWidgetById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield footer_widget_model_1.FooterWidget.findOne({ _id: req.params.id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Footer widget not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Footer widget retrieved successfully', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.getFooterWidgetById = getFooterWidgetById;
const updateFooterWidgetById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const payload = footer_widget_validation_1.footerWidgetUpdateValidation.parse(req.body);
        const updated = yield footer_widget_model_1.FooterWidget.findOneAndUpdate({ _id: id, isDeleted: false }, payload, { new: true });
        if (!updated)
            return next(new appError_1.appError('Footer widget not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Footer widget updated successfully', data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.updateFooterWidgetById = updateFooterWidgetById;
const deleteFooterWidgetById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updated = yield footer_widget_model_1.FooterWidget.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!updated)
            return next(new appError_1.appError('Footer widget not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Footer widget deleted successfully', data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteFooterWidgetById = deleteFooterWidgetById;
