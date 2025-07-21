"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jurneyRouter = void 0;
const express_1 = __importDefault(require("express"));
const jurney_controller_1 = require("./jurney.controller");
const router = express_1.default.Router();
router.post('/', jurney_controller_1.createJurney);
router.get('/:id', jurney_controller_1.getJurneyById);
router.get('/', jurney_controller_1.getAllJurneys);
router.put('/:id', jurney_controller_1.updateJurney);
router.delete('/:id', jurney_controller_1.deleteJurney);
exports.jurneyRouter = router;
