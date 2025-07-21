"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRouter = void 0;
const express_1 = __importDefault(require("express"));
const post_controller_1 = require("./post.controller");
const router = express_1.default.Router();
router.post('/', post_controller_1.createPost);
router.get('/:id', post_controller_1.getPostWithId);
router.put('/:id', post_controller_1.postUpdateWithId);
router.delete('/:id', post_controller_1.deletePostWithId);
router.post('/:id/like', post_controller_1.likePost);
router.post('/:id/comment', post_controller_1.addComment);
router.get('/location/:location', post_controller_1.getPostsByLocation);
router.patch('/:id/status', post_controller_1.updatePostStatus);
exports.postRouter = router;
