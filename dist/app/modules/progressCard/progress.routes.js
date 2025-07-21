"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressRouter = void 0;
const express_1 = __importDefault(require("express"));
const progress_controller_1 = require("./progress.controller");
const router = express_1.default.Router();
router.post('/', progress_controller_1.createProgress);
router.get('/:id', progress_controller_1.getProgressById);
router.get('/', progress_controller_1.getAllProgress);
router.put('/:id', progress_controller_1.updateProgress);
router.delete('/:id', progress_controller_1.deleteProgress);
exports.progressRouter = router;
