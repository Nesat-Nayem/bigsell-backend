"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateRouter = void 0;
const express_1 = __importDefault(require("express"));
const state_controller_1 = require("./state.controller");
const router = express_1.default.Router();
router.post('/', state_controller_1.createState);
router.get('/:id', state_controller_1.getStateWithId);
router.get('/', state_controller_1.getAllStates);
router.put('/:id', state_controller_1.stateUpdateWithId);
router.delete('/:id', state_controller_1.deleteStateWithId);
exports.stateRouter = router;
