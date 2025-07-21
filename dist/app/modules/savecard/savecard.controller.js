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
exports.deleteSaveCardById = exports.updateSaveCardById = exports.getSaveCardById = exports.getAllSaveCards = exports.createSaveCard = void 0;
const savecard_model_1 = require("./savecard.model");
const savecard_validation_1 = require("./savecard.validation");
const appError_1 = require("../../errors/appError");
// import { userInterface } from "../auth/auth.interface";
const createSaveCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cardNumber, expiryDate, cvv, nameOnCard, isDefault } = req.body;
        // Validate the input
        const validatedData = savecard_validation_1.saveCardValidation.parse({
            cardNumber,
            expiryDate,
            cvv,
            nameOnCard,
            isDefault: isDefault === 'true' || isDefault === true
        });
        // If this card is set as default, unset any existing default cards
        if (validatedData.isDefault) {
            yield savecard_model_1.SaveCard.updateMany({ userId: req.user._id, isDeleted: false }, { isDefault: false });
        }
        // Create a new saved card
        const saveCard = new savecard_model_1.SaveCard(Object.assign(Object.assign({}, validatedData), { userId: req.user._id }));
        yield saveCard.save();
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "Card saved successfully",
            data: saveCard,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createSaveCard = createSaveCard;
const getAllSaveCards = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saveCards = yield savecard_model_1.SaveCard.find({
            userId: req.user._id,
            isDeleted: false
        }).sort({ isDefault: -1, createdAt: -1 });
        if (saveCards.length === 0) {
            res.json({
                success: true,
                statusCode: 200,
                message: "No saved cards found",
                data: [],
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Saved cards retrieved successfully",
            data: saveCards,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllSaveCards = getAllSaveCards;
const getSaveCardById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saveCard = yield savecard_model_1.SaveCard.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isDeleted: false
        });
        if (!saveCard) {
            return next(new appError_1.appError("Saved card not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Saved card retrieved successfully",
            data: saveCard,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getSaveCardById = getSaveCardById;
const updateSaveCardById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cardId = req.params.id;
        const { expiryDate, nameOnCard, isDefault } = req.body;
        // Find the card to update
        const saveCard = yield savecard_model_1.SaveCard.findOne({
            _id: cardId,
            userId: req.user._id,
            isDeleted: false
        });
        if (!saveCard) {
            return next(new appError_1.appError("Saved card not found", 404));
        }
        // Prepare update data
        const updateData = {};
        if (expiryDate !== undefined) {
            updateData.expiryDate = expiryDate;
        }
        if (nameOnCard !== undefined) {
            updateData.nameOnCard = nameOnCard;
        }
        if (isDefault !== undefined) {
            updateData.isDefault = isDefault === 'true' || isDefault === true;
        }
        // Validate the update data
        if (Object.keys(updateData).length > 0) {
            const validatedData = savecard_validation_1.saveCardUpdateValidation.parse(updateData);
            // If this card is being set as default, unset any existing default cards
            if (validatedData.isDefault) {
                yield savecard_model_1.SaveCard.updateMany({ userId: req.user._id, isDeleted: false, _id: { $ne: cardId } }, { isDefault: false });
            }
            // Update the card
            const updatedCard = yield savecard_model_1.SaveCard.findByIdAndUpdate(cardId, validatedData, { new: true });
            res.json({
                success: true,
                statusCode: 200,
                message: "Saved card updated successfully",
                data: updatedCard,
            });
            return;
        }
        // If no updates provided
        res.json({
            success: true,
            statusCode: 200,
            message: "No changes to update",
            data: saveCard,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateSaveCardById = updateSaveCardById;
const deleteSaveCardById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const saveCard = yield savecard_model_1.SaveCard.findOneAndUpdate({ _id: req.params.id, userId: req.user._id, isDeleted: false }, { isDeleted: true }, { new: true });
        if (!saveCard) {
            return next(new appError_1.appError("Saved card not found", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Saved card deleted successfully",
            data: saveCard,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteSaveCardById = deleteSaveCardById;
