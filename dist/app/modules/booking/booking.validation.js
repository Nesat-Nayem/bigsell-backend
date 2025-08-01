"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingValidation = void 0;
const zod_1 = require("zod");
exports.bookingValidation = zod_1.z.object({
    serviceId: zod_1.z.string(),
    slotId: zod_1.z.string(),
    vehicleType: zod_1.z.string(),
    vehicleBrand: zod_1.z.string(),
    vehicleModel: zod_1.z.string(),
    manufacturingYear: zod_1.z.number(),
    registrationPlate: zod_1.z.string(),
});
