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
exports.addNewsComment = exports.likeNews = exports.deleteNews = exports.updateNews = exports.getAllNews = exports.getNewsById = exports.createNews = void 0;
const news_model_1 = require("./news.model");
const news_validation_1 = require("./news.validation");
const appError_1 = require("../../errors/appError");
const createNews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, image, isDeleted } = news_validation_1.newsValidation.parse(req.body);
        const news = new news_model_1.News({
            title,
            description,
            image,
            isDeleted,
        });
        yield news.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "News created successfully",
            data: news,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createNews = createNews;
const getNewsById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const news = yield news_model_1.News.findById(req.params.id)
            .populate('likes', 'name image')
            .populate('comments.user', 'name image');
        if (!news) {
            return next(new appError_1.appError("News not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "News retrieved successfully",
            data: news,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getNewsById = getNewsById;
const getAllNews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const news = yield news_model_1.News.find({ isDeleted: false })
            .populate('likes', 'name image')
            .populate('comments.user', 'name image');
        if (news.length === 0) {
            return next(new appError_1.appError("No news found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "News retrieved successfully",
            data: news,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllNews = getAllNews;
const updateNews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateFields = req.body;
        const news = yield news_model_1.News.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });
        if (!news) {
            return next(new appError_1.appError("News not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "News updated successfully",
            data: news,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateNews = updateNews;
const deleteNews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const news = yield news_model_1.News.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!news) {
            return next(new appError_1.appError("News not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "News deleted successfully",
            data: news,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteNews = deleteNews;
const likeNews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newsId = req.params.id;
        const { userId } = req.body;
        const news = yield news_model_1.News.findById(newsId);
        if (!news) {
            return next(new appError_1.appError("News not found", 404));
        }
        if (news.likes.includes(userId)) {
            news.likes = news.likes.filter(id => id.toString() !== userId.toString());
            news.likeCount--;
        }
        else {
            news.likes.push(userId);
            news.likeCount++;
        }
        yield news.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "News like updated successfully",
            data: news,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.likeNews = likeNews;
const addNewsComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newsId = req.params.id;
        const { userId, text } = req.body;
        const news = yield news_model_1.News.findById(newsId);
        if (!news) {
            return next(new appError_1.appError("News not found", 404));
        }
        const newComment = {
            user: userId,
            text,
            createdAt: new Date()
        };
        news.comments.push(newComment);
        news.commentCount++;
        yield news.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Comment added successfully",
            data: news,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addNewsComment = addNewsComment;
