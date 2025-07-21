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
exports.logActivity = logActivity;
const activity_service_1 = __importDefault(require("../activity/activity.service"));
function logActivity(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield activity_service_1.default.logActivity(data);
        }
        catch (error) {
            // Don't throw errors for activity logging to avoid disrupting main operations
            console.error('Failed to log activity:', error);
        }
    });
}
