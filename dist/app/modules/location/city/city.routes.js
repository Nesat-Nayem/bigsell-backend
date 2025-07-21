"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cityRouter = void 0;
const express_1 = __importDefault(require("express"));
const city_controller_1 = require("./city.controller");
const router = express_1.default.Router();
router.post('/', city_controller_1.createCity);
router.get('/:id', city_controller_1.getCityWithId);
router.get('/', city_controller_1.getAllCitys);
router.put('/:id', city_controller_1.cityUpdateWithId);
router.delete('/:id', city_controller_1.deleteCityWithId);
exports.cityRouter = router;
