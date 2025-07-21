"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.legislativeRouter = void 0;
const express_1 = __importDefault(require("express"));
const legislative_controller_1 = require("./legislative.controller");
const router = express_1.default.Router();
router.post('/', legislative_controller_1.createLegislative);
router.get('/:id', legislative_controller_1.getLegislativeById);
router.get('/', legislative_controller_1.getAllLegislatives);
router.put('/:id', legislative_controller_1.updateLegislative);
router.delete('/:id', legislative_controller_1.deleteLegislative);
exports.legislativeRouter = router;
