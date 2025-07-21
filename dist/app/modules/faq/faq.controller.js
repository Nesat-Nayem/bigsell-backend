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
exports.generateFAQAnswer = exports.deleteFAQById = exports.updateFAQById = exports.getFAQById = exports.getAllFAQs = exports.createFAQ = void 0;
const faq_model_1 = require("./faq.model");
const faq_validation_1 = require("./faq.validation");
const appError_1 = require("../../errors/appError");
const aiService_1 = require("../../services/aiService");
const createFAQ = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question, answer, category, order, isActive } = req.body;
        // Validate the input
        const validatedData = faq_validation_1.faqValidation.parse({
            question,
            answer,
            category,
            order: order ? parseInt(order) : undefined,
            isActive: isActive === 'true' || isActive === true
        });
        // Create a new FAQ
        const faq = new faq_model_1.FAQ(validatedData);
        yield faq.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "FAQ created successfully",
            data: faq,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createFAQ = createFAQ;
const getAllFAQs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get only active FAQs if requested
        const { active, category } = req.query;
        const filter = { isDeleted: false };
        if (active === 'true') {
            filter.isActive = true;
        }
        if (category) {
            filter.category = category;
        }
        const faqs = yield faq_model_1.FAQ.find(filter).sort({ order: 1, createdAt: -1 });
        if (faqs.length === 0) {
            res.json({
                success: true,
                statusCode: 200,
                message: "No FAQs found",
                data: [],
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "FAQs retrieved successfully",
            data: faqs,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllFAQs = getAllFAQs;
const getFAQById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faq = yield faq_model_1.FAQ.findOne({
            _id: req.params.id,
            isDeleted: false
        });
        if (!faq) {
            return next(new appError_1.appError("FAQ not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "FAQ retrieved successfully",
            data: faq,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getFAQById = getFAQById;
const updateFAQById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faqId = req.params.id;
        const { question, answer, category, order, isActive } = req.body;
        // Find the FAQ to update
        const faq = yield faq_model_1.FAQ.findOne({
            _id: faqId,
            isDeleted: false
        });
        if (!faq) {
            return next(new appError_1.appError("FAQ not found", 404));
        }
        // Prepare update data
        const updateData = {};
        if (question !== undefined) {
            updateData.question = question;
        }
        if (answer !== undefined) {
            updateData.answer = answer;
        }
        if (category !== undefined) {
            updateData.category = category;
        }
        if (order !== undefined) {
            updateData.order = parseInt(order);
        }
        if (isActive !== undefined) {
            updateData.isActive = isActive === 'true' || isActive === true;
        }
        // Validate the update data
        if (Object.keys(updateData).length > 0) {
            const validatedData = faq_validation_1.faqUpdateValidation.parse(updateData);
            // Update the FAQ
            const updatedFAQ = yield faq_model_1.FAQ.findByIdAndUpdate(faqId, validatedData, { new: true });
            res.json({
                success: true,
                statusCode: 200,
                message: "FAQ updated successfully",
                data: updatedFAQ,
            });
            return;
        }
        // If no updates provided
        res.json({
            success: true,
            statusCode: 200,
            message: "No changes to update",
            data: faq,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateFAQById = updateFAQById;
const deleteFAQById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faq = yield faq_model_1.FAQ.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!faq) {
            return next(new appError_1.appError("FAQ not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "FAQ deleted successfully",
            data: faq,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteFAQById = deleteFAQById;
// Generate FAQ answer using AI
const generateFAQAnswer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question } = req.body;
        if (!question) {
            return next(new appError_1.appError("Question is required", 400));
        }
        const prompt = `Generate a helpful, concise answer for this FAQ question: "${question}". 
    The answer should be informative, friendly, and no more than 3-4 sentences.`;
        const generatedAnswer = yield aiService_1.aiService.generateText(prompt);
        res.json({
            success: true,
            statusCode: 200,
            message: "Answer generated successfully",
            data: {
                question,
                answer: generatedAnswer
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.generateFAQAnswer = generateFAQAnswer;
