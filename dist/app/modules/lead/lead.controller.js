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
exports.deleteLeadWithId = exports.leadUpdateWithId = exports.getAllLeads = exports.getLeadWithId = exports.createLead = void 0;
const lead_model_1 = require("./lead.model");
const lead_validation_1 = require("./lead.validation");
const appError_1 = require("../../errors/appError");
const createLead = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leadData = lead_validation_1.leadValidation.parse(req.body);
        const lead = new lead_model_1.Lead(leadData);
        yield lead.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Lead created successfully",
            data: lead,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createLead = createLead;
const getLeadWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lead = yield lead_model_1.Lead.findById(req.params.id);
        if (!lead) {
            return next(new appError_1.appError("Lead not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Lead retrieved successfully",
            data: lead,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getLeadWithId = getLeadWithId;
const getAllLeads = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lead = yield lead_model_1.Lead.find({ isDeleted: false });
        if (lead.length === 0) {
            return next(new appError_1.appError("No data found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Lead retrieved successfully",
            data: lead,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllLeads = getAllLeads;
const leadUpdateWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateFields = req.body;
        const lead = yield lead_model_1.Lead.findByIdAndUpdate(req.params.id, {
            $set: updateFields,
        }, { new: true });
        if (!lead) {
            return next(new appError_1.appError("Lead not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Lead updated successfully",
            data: lead,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.leadUpdateWithId = leadUpdateWithId;
const deleteLeadWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lead = yield lead_model_1.Lead.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!lead) {
            return next(new appError_1.appError("Lead not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Lead deleted successfully",
            data: lead,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteLeadWithId = deleteLeadWithId;
