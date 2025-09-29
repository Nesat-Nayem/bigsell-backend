"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
// For Vercel deployment, we need to handle database connection differently
let isConnected = false;
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        if (isConnected) {
            return;
        }
        try {
            yield mongoose_1.default.connect(config_1.default.database_url);
            isConnected = true;
            console.log('Database connected successfully');
        }
        catch (err) {
            console.log('Database connection error:', err);
            throw err;
        }
    });
}
// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = config_1.default.port || 3000;
    connectDB().then(() => {
        app_1.default.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }).catch((err) => {
        console.log('Failed to start server:', err);
    });
}
else {
    // Connect to database on module initialization for Vercel/production
    connectDB();
}
// For Vercel deployment - export the app directly
module.exports = app_1.default;
