"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.opinionPollRouter = void 0;
const express_1 = __importDefault(require("express"));
const oPoll_controller_1 = require("./oPoll.controller");
const router = express_1.default.Router();
router.post('/', oPoll_controller_1.createPoll);
router.get('/:id', oPoll_controller_1.getPollById);
router.get('/', oPoll_controller_1.getAllPolls);
router.put('/:id', oPoll_controller_1.updatePoll);
router.delete('/:id', oPoll_controller_1.deletePoll);
router.post('/:id/vote', oPoll_controller_1.votePoll);
exports.opinionPollRouter = router;
