"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.footerWidgetUpdateValidation = exports.footerWidgetCreateValidation = void 0;
const zod_1 = require("zod");
exports.footerWidgetCreateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    subtitle: zod_1.z.string().min(1, 'Subtitle is required'),
});
exports.footerWidgetUpdateValidation = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    subtitle: zod_1.z.string().min(1).optional(),
});
