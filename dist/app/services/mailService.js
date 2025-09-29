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
exports.getTransporter = void 0;
exports.sendMail = sendMail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const getTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    if (!host || !user || !pass) {
        throw new Error('SMTP configuration missing. Please set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_PORT');
    }
    return nodemailer_1.default.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
};
exports.getTransporter = getTransporter;
function sendMail(_a) {
    return __awaiter(this, arguments, void 0, function* ({ to, subject, html }) {
        const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com';
        const transporter = (0, exports.getTransporter)();
        const info = yield transporter.sendMail({ from, to, subject, html });
        return info;
    });
}
