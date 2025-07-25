"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Configure dotenv with quiet option to suppress all logs
dotenv_1.default.config({
    path: path_1.default.join(process.cwd(), '.env'),
    quiet: true // Suppress all dotenv logs
});
exports.default = {
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL
};
