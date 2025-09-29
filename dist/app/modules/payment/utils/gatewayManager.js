"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Paytm = exports.CCAvenue = void 0;
var ccavenue_1 = require("../gateways/ccavenue");
Object.defineProperty(exports, "CCAvenue", { enumerable: true, get: function () { return __importDefault(ccavenue_1).default; } });
var paytm_1 = require("../gateways/paytm");
Object.defineProperty(exports, "Paytm", { enumerable: true, get: function () { return __importDefault(paytm_1).default; } });
