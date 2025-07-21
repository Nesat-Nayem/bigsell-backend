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
exports.deleteJob = exports.updateJob = exports.getAllJobs = exports.getJobById = exports.createJob = void 0;
const job_model_1 = require("./job.model");
const job_validation_1 = require("./job.validation");
const appError_1 = require("../../errors/appError");
const createJob = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = job_validation_1.jobValidation.parse(req.body);
        const job = new job_model_1.Job(validatedData);
        yield job.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Job created successfully",
            data: job,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createJob = createJob;
const getJobById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield job_model_1.Job.findById(req.params.id);
        if (!job) {
            return next(new appError_1.appError("Job not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Job retrieved successfully",
            data: job,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getJobById = getJobById;
const getAllJobs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobs = yield job_model_1.Job.find({ isDeleted: false });
        if (jobs.length === 0) {
            return next(new appError_1.appError("No jobs found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Jobs retrieved successfully",
            data: jobs,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllJobs = getAllJobs;
const updateJob = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield job_model_1.Job.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!job) {
            return next(new appError_1.appError("Job not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Job updated successfully",
            data: job,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateJob = updateJob;
const deleteJob = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield job_model_1.Job.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        if (!job) {
            return next(new appError_1.appError("Job not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Job deleted successfully",
            data: job,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteJob = deleteJob;
