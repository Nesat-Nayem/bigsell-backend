"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceRouter = void 0;
const express_1 = __importDefault(require("express"));
const service_controller_1 = require("./service.controller");
const router = express_1.default.Router();
router.post('/', service_controller_1.createService);
router.get('/:id', service_controller_1.getServiceWithId);
router.get('/', service_controller_1.getAllServices);
router.put('/:id', service_controller_1.updateWithId);
router.delete('/:id', service_controller_1.deleteWithId);
exports.serviceRouter = router;
