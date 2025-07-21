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
const oPoll_model_1 = require("./oPoll.model");
const oPoll_validation_1 = require("./oPoll.validation");
const appError_1 = require("../../errors/appError");
const createPoll = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question, options, hashtags } = oPoll_validation_1.opinionPollValidation.parse(req.body);
        const formattedOptions = options.map(opt => (Object.assign(Object.assign({}, opt), { votes: 0 })));
        const poll = new oPoll_model_1.OpinionPoll({
            question,
            options: formattedOptions,
            hashtags
        });
        yield poll.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Opinion poll created successfully",
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
        const poll = yield oPoll_model_1.OpinionPoll.findById(req.params.id);
        if (!poll) {
            return next(new appError_1.appError("Opinion poll not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Opinion poll retrieved successfully",
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
        const polls = yield oPoll_model_1.OpinionPoll.find({ isDeleted: false }).sort({ createdAt: -1 });
        if (polls.length === 0) {
            return next(new appError_1.appError("No opinion polls found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Opinion polls retrieved successfully",
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
        const poll = yield oPoll_model_1.OpinionPoll.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!poll) {
            return next(new appError_1.appError("Opinion poll not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Opinion poll updated successfully",
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
        const poll = yield oPoll_model_1.OpinionPoll.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!poll) {
            return next(new appError_1.appError("Opinion poll not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Opinion poll deleted successfully",
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
        const { optionIndex } = oPoll_validation_1.voteValidation.parse(req.body);
        const poll = yield oPoll_model_1.OpinionPoll.findById(req.params.id);
        if (!poll) {
            return next(new appError_1.appError("Opinion poll not found", 404));
        }
        if (optionIndex >= poll.options.length) {
            return next(new appError_1.appError("Invalid option index", 400));
        }
        poll.options[optionIndex].votes += 1;
        poll.totalVotes += 1;
        // Update percentageRange and weeklyChange based on votes
        poll.options = poll.options.map(option => {
            const percentage = (option.votes / poll.totalVotes) * 100;
            return Object.assign(Object.assign({}, option), { percentageRange: `${Math.floor(percentage)}% - ${Math.ceil(percentage)}%`, weeklyChange: `${Math.round(percentage)}% This Week` });
        });
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
