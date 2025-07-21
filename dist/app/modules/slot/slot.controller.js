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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSlots = exports.createSlot = void 0;
const slot_validation_1 = require("./slot.validation");
const slot_model_1 = require("./slot.model");
const appError_1 = require("../../errors/appError");
const createSlot = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { service, date, startTime, endTime } = slot_validation_1.slotValidation.parse(req.body);
        const startDateTime = new Date(`${date}T${startTime}`);
        const endDateTime = new Date(`${date}T${endTime}`);
        const slots = [];
        let currentTime = startDateTime;
        while (currentTime < endDateTime) {
            const slot = new slot_model_1.Slot({
                service,
                date,
                startTime: currentTime.toISOString(),
                endTime: new Date(currentTime.getTime() + 60 * 60000).toISOString(),
            });
            slots.push(slot);
            currentTime = new Date(currentTime.getTime() + 60 * 60000);
        }
        yield slot_model_1.Slot.insertMany(slots);
        res.status(201).json({
            success: true,
            statusCode: 200,
            message: 'Slots created successfully',
            data: slots,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createSlot = createSlot;
const getAllSlots = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, serviceId } = req.query;
        const query = { isBooked: 'available' };
        if (date) {
            query.date = new Date(date);
        }
        if (serviceId) {
            query.service = serviceId;
        }
        const slots = yield slot_model_1.Slot.find(query).populate('service');
        if (slots.length === 0) {
            return next(new appError_1.appError('No data found', 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: 'Available slots retrieved successfully',
            data: slots,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllSlots = getAllSlots;
