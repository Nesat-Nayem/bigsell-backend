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
exports.votePoll = exports.deletePoll = exports.updatePoll = exports.getAllPolls = exports.getPollById = exports.createPoll = void 0;
const pPoll_model_1 = require("./pPoll.model");
const pPoll_validation_1 = require("./pPoll.validation");
const appError_1 = require("../../errors/appError");
const createPoll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question, options, hashtags } = pPoll_validation_1.publicPollValidation.parse(req.body);
        const formattedOptions = options.map(opt => ({
            text: opt,
            votes: 0
        }));
        const poll = new pPoll_model_1.PublicPoll({
            question,
            options: formattedOptions,
            hashtags
        });
        yield poll.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Poll created successfully",
            data: poll,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createPoll = createPoll;
const getPollById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const poll = yield pPoll_model_1.PublicPoll.findById(req.params.id);
        if (!poll) {
            return next(new appError_1.appError("Poll not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Poll retrieved successfully",
            data: poll,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPollById = getPollById;
const getAllPolls = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const polls = yield pPoll_model_1.PublicPoll.find({ isDeleted: false }).sort({ createdAt: -1 });
        if (polls.length === 0) {
            return next(new appError_1.appError("No polls found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Polls retrieved successfully",
            data: polls,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllPolls = getAllPolls;
const updatePoll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const poll = yield pPoll_model_1.PublicPoll.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!poll) {
            return next(new appError_1.appError("Poll not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Poll updated successfully",
            data: poll,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePoll = updatePoll;
const deletePoll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const poll = yield pPoll_model_1.PublicPoll.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!poll) {
            return next(new appError_1.appError("Poll not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Poll deleted successfully",
            data: poll,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deletePoll = deletePoll;
const votePoll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { optionIndex } = pPoll_validation_1.voteValidation.parse(req.body);
        const poll = yield pPoll_model_1.PublicPoll.findById(req.params.id);
        if (!poll) {
            return next(new appError_1.appError("Poll not found", 404));
        }
        if (optionIndex >= poll.options.length) {
            return next(new appError_1.appError("Invalid option index", 400));
        }
        poll.options[optionIndex].votes += 1;
        poll.totalVotes += 1;
        yield poll.save();
        res.json({
            success: true,
            statusCode: 200,
            message: "Vote recorded successfully",
            data: poll,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.votePoll = votePoll;
