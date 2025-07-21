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
exports.deletePostWithId = exports.postUpdateWithId = exports.getAllPosts = exports.getPostsByLocation = exports.addComment = exports.updatePostStatus = exports.likePost = exports.getPostWithId = exports.createPost = void 0;
const post_model_1 = require("./post.model");
const post_validation_1 = require("./post.validation");
const appError_1 = require("../../errors/appError");
const createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    {
        try {
            const { img, userName, video, audio, postText, location, isDeleted } = post_validation_1.inqueryValidation.parse(req.body);
            console.log(req.body);
            const post = new post_model_1.Post({
                userName,
                img,
                audio,
                video,
                postText,
                location,
                isDeleted,
            });
            yield post.save();
            res.status(201).json({
                success: true,
                statusCode: 200,
                message: "Post created successfully",
                data: post,
            });
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
});
exports.createPost = createPost;
const getPostWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_model_1.Post.findById(req.params.id)
            .populate('likes', 'name image')
            .populate('comments.user', 'name image');
        if (!post) {
            return next(new appError_1.appError("Post not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Post retrieved successfully",
            data: post,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPostWithId = getPostWithId;
const likePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.id;
        const { userId } = req.body;
        const post = yield post_model_1.Post.findById(postId);
        if (!post) {
            return next(new appError_1.appError("Post not found", 404));
        }
        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
            post.likeCount--;
        }
        else {
            post.likes.push(userId);
            post.likeCount++;
        }
        yield post.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Post like updated successfully",
            data: post,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.likePost = likePost;
const updatePostStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        const post = yield post_model_1.Post.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!post) {
            return next(new appError_1.appError("Post not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Post status updated successfully",
            data: post,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePostStatus = updatePostStatus;
const addComment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const postId = req.params.id;
        const { userId, text } = req.body;
        const post = yield post_model_1.Post.findById(postId);
        if (!post) {
            return next(new appError_1.appError("Post not found", 404));
        }
        const newComment = {
            user: userId,
            text,
            createdAt: new Date()
        };
        post.comments.push(newComment);
        post.commentCount++;
        yield post.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Comment added successfully",
            data: post,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addComment = addComment;
const getPostsByLocation = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const location = req.params.location;
        const posts = yield post_model_1.Post.find({
            location: { $regex: location, $options: 'i' },
            isDeleted: false
        })
            .populate('likes', 'name image')
            .populate('comments.user', 'name image');
        if (posts.length === 0) {
            return next(new appError_1.appError("No posts found for this location", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Posts retrieved successfully",
            data: posts,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPostsByLocation = getPostsByLocation;
const getAllPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let post;
        const hasPageQuery = req.query.page !== undefined;
        if (hasPageQuery) {
            const page = parseInt(req.query.page) || 1;
            const limit = 5;
            const skip = (page - 1) * limit;
            post = yield post_model_1.Post.find({ isDeleted: false })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                path: 'likes',
                select: 'name image'
            })
                .populate({
                path: 'comments.user',
                select: 'name image'
            })
                .populate({
                path: 'userName',
                select: 'userName img',
                model: 'User'
            });
            const totalPosts = yield post_model_1.Post.countDocuments({ isDeleted: false });
            const hasMore = totalPosts > skip + post.length;
            if (post.length === 0) {
                return next(new appError_1.appError("No data found", 404));
            }
            return res.json({
                success: true,
                statusCode: 200,
                message: "Posts retrieved successfully",
                data: post,
                pagination: {
                    currentPage: page,
                    hasMore,
                    totalPosts
                }
            });
        }
        else {
            // Return all posts when no page query is present
            post = yield post_model_1.Post.find({ isDeleted: false })
                .sort({ createdAt: -1 })
                .populate({
                path: 'likes',
                select: 'name image'
            })
                .populate({
                path: 'comments.user',
                select: 'name image'
            })
                .populate({
                path: 'userName',
                select: 'userName img',
                model: 'User'
            });
            if (post.length === 0) {
                return next(new appError_1.appError("No data found", 404));
            }
            return res.json({
                success: true,
                statusCode: 200,
                message: "Posts retrieved successfully",
                data: post
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.getAllPosts = getAllPosts;
const postUpdateWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updateFields = req.body;
        const post = yield post_model_1.Post.findByIdAndUpdate(req.params.id, {
            $set: updateFields,
        }, { new: true });
        if (!post) {
            return next(new appError_1.appError("Post not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Post updated successfully",
            data: post,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.postUpdateWithId = postUpdateWithId;
const deletePostWithId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_model_1.Post.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!post) {
            return next(new appError_1.appError("Post not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Post deleted successfully",
            data: post,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deletePostWithId = deletePostWithId;
