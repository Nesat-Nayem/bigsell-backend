"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicPollRouter = void 0;
const express_1 = __importDefault(require("express"));
const pPoll_controller_1 = require("./pPoll.controller");
const router = express_1.default.Router();
router.post('/', pPoll_controller_1.createPoll);
router.get('/:id', pPoll_controller_1.getPollById);
router.get('/', pPoll_controller_1.getAllPolls);
router.put('/:id', pPoll_controller_1.updatePoll);
router.delete('/:id', pPoll_controller_1.deletePoll);
router.post('/:id/vote', pPoll_controller_1.votePoll);
exports.publicPollRouter = router;
