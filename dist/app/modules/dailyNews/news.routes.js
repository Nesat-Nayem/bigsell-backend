"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsRouter = void 0;
const express_1 = __importDefault(require("express"));
const news_controller_1 = require("./news.controller");
const router = express_1.default.Router();
router.post('/', news_controller_1.createNews);
router.get('/:id', news_controller_1.getNewsById);
router.get('/', news_controller_1.getAllNews);
router.put('/:id', news_controller_1.updateNews);
router.delete('/:id', news_controller_1.deleteNews);
router.post('/:id/like', news_controller_1.likeNews);
router.post('/:id/comment', news_controller_1.addNewsComment);
exports.newsRouter = router;
