"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadRouter = void 0;
const express_1 = __importDefault(require("express"));
const lead_controller_1 = require("./lead.controller");
const router = express_1.default.Router();
router.post('/', lead_controller_1.createLead);
router.get('/:id', lead_controller_1.getLeadWithId);
router.get('/', lead_controller_1.getAllLeads);
router.put('/:id', lead_controller_1.leadUpdateWithId);
router.delete('/:id', lead_controller_1.deleteLeadWithId);
exports.LeadRouter = router;
