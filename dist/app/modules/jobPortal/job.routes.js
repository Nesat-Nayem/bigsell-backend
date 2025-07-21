"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRouter = void 0;
const express_1 = __importDefault(require("express"));
const job_controller_1 = require("./job.controller");
const router = express_1.default.Router();
router.post('/', job_controller_1.createJob);
router.get('/:id', job_controller_1.getJobById);
router.get('/', job_controller_1.getAllJobs);
router.put('/:id', job_controller_1.updateJob);
router.delete('/:id', job_controller_1.deleteJob);
exports.jobRouter = router;
