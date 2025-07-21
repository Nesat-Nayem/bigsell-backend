"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countryRouter = void 0;
const express_1 = __importDefault(require("express"));
const country_controller_1 = require("./country.controller");
const router = express_1.default.Router();
router.post('/', country_controller_1.createCountry);
router.get('/:id', country_controller_1.getCountryWithId);
router.get('/', country_controller_1.getAllCountrys);
router.put('/:id', country_controller_1.countryUpdateWithId);
router.delete('/:id', country_controller_1.deleteCountryWithId);
exports.countryRouter = router;
