"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.voterRouter = void 0;
const express_1 = __importDefault(require("express"));
const voter_controller_1 = require("./voter.controller");
const router = express_1.default.Router();
router.post('/', voter_controller_1.createVoter);
router.get('/filter', voter_controller_1.getFilteredVoters); // Add this new route
router.get('/:id', voter_controller_1.getVoterById);
router.get('/', voter_controller_1.getAllVoters);
router.put('/:id', voter_controller_1.updateVoter);
router.delete('/:id', voter_controller_1.deleteVoter);
router.get('/location/:location', voter_controller_1.getVotersByLocation);
exports.voterRouter = router;
