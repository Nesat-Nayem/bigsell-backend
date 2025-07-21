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
exports.bookTableByScan = exports.deleteQRCodeById = exports.updateQRCodeById = exports.getQRCodeById = exports.getAllQRCodes = exports.createQRCode = void 0;
const qrcode_model_1 = require("./qrcode.model");
const hotel_model_1 = require("../hotel/hotel.model");
const qrcode_validation_1 = require("./qrcode.validation");
const appError_1 = require("../../errors/appError");
const cloudinary_1 = require("../../config/cloudinary");
const qrcode_1 = __importDefault(require("qrcode"));
const canvas_1 = require("canvas");
// Helper function to upload image to Cloudinary
const uploadToCloudinary = (dataUrl, tableNumber, hotelName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield cloudinary_1.cloudinary.uploader.upload(dataUrl, {
            folder: "restaurant-qrcodes",
            public_id: `${hotelName}_table_${tableNumber}_${Date.now()}`,
        });
        return result.secure_url;
    }
    catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new appError_1.appError("Failed to upload QR code to Cloudinary", 500);
    }
});
// Helper function to generate QR code with logo
const generateQRCodeWithLogo = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Generate QR code as PNG buffer
        const qrCodeBuffer = yield qrcode_1.default.toBuffer(data, {
            type: "png",
            width: 300,
            margin: 2,
            color: {
                dark: "#000000",
                light: "#FFFFFF",
            },
        });
        // Create canvas
        const canvas = (0, canvas_1.createCanvas)(300, 300);
        const ctx = canvas.getContext("2d");
        // Load QR code image onto canvas
        const qrImage = yield (0, canvas_1.loadImage)(qrCodeBuffer);
        ctx.drawImage(qrImage, 0, 0, 300, 300);
        // Create logo area (white circle background)
        const logoSize = 60;
        const centerX = 150;
        const centerY = 150;
        // Draw white circle background for logo
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2 + 5, 0, 2 * Math.PI);
        ctx.fill();
        // Draw border around logo area
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2 + 5, 0, 2 * Math.PI);
        ctx.stroke();
        try {
            // Try to load logo from public folder or URL
            const logoPath = process.env.LOGO_PATH || "https://i.ibb.co/d4F1y3mZ/logo.png";
            const logoImage = yield (0, canvas_1.loadImage)(logoPath);
            // Draw logo in center
            ctx.drawImage(logoImage, centerX - logoSize / 2, centerY - logoSize / 2, logoSize, logoSize);
        }
        catch (logoError) {
            // If logo loading fails, draw a simple red circle with text
            ctx.fillStyle = "#d23b4b";
            ctx.beginPath();
            ctx.arc(centerX, centerY, logoSize / 2, 0, 2 * Math.PI);
            ctx.fill();
            // Add text
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.fillText("MENU", centerX, centerY + 4);
        }
        // Convert canvas to data URL
        return canvas.toDataURL("image/png");
    }
    catch (error) {
        console.error("Error generating QR code with logo:", error);
        // Fallback to regular QR code
        return yield qrcode_1.default.toDataURL(data);
    }
});
const createQRCode = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { tableNumber, hotelId, seatNumber } = req.body;
        // If user is a vendor, they can only create a QR code for their own hotel
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "vendor") {
            const vendorHotelId = (_b = req.user.vendorDetails) === null || _b === void 0 ? void 0 : _b.hotel;
            if (!vendorHotelId || vendorHotelId.toString() !== hotelId) {
                return next(new appError_1.appError("You can only create QR codes for your own hotel.", 403));
            }
        }
        // Validate the input
        const validatedData = qrcode_validation_1.qrCodeValidation.parse({
            tableNumber,
            hotelId,
            seatNumber,
        });
        // Check if hotel exists
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: validatedData.hotelId,
            isDeleted: false,
        });
        if (!hotel) {
            return next(new appError_1.appError("Hotel not found", 404));
        }
        // Check if QR code for this table and hotel already exists
        const existingQRCode = yield qrcode_model_1.QRCode.findOne({
            tableNumber: validatedData.tableNumber,
            hotelId: validatedData.hotelId,
            isDeleted: false,
        });
        if (existingQRCode) {
            return next(new appError_1.appError(`QR Code for table ${validatedData.tableNumber} in ${hotel.name} already exists.`, 409));
        }
        // Generate QR code data - you might want to encode a URL with hotel and table info
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
        const qrData = `${frontendUrl}/hotel-details/${validatedData.hotelId}?table=${validatedData.tableNumber}&seats=${validatedData.seatNumber}`;
        // Generate QR code with logo
        const qrCodeDataURL = yield generateQRCodeWithLogo(qrData);
        // Upload QR code image to Cloudinary
        const imageUrl = yield uploadToCloudinary(qrCodeDataURL, validatedData.tableNumber, hotel.name);
        // Create a new QR code entry
        const qrCode = new qrcode_model_1.QRCode({
            tableNumber: validatedData.tableNumber,
            hotelId: validatedData.hotelId,
            seatNumber: validatedData.seatNumber,
            qrCodeImage: imageUrl,
        });
        yield qrCode.save();
        // Populate hotel info for response
        yield qrCode.populate("hotelId", "name");
        res.status(201).json({
            success: true,
            statusCode: 201,
            message: "QR Code created successfully",
            data: qrCode,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createQRCode = createQRCode;
const getAllQRCodes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const query = { isDeleted: false };
        const { hotelId } = req.query;
        // If the user is a vendor or staff, only show QR codes for their hotel
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === "vendor" || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) === "staff") {
            const userHotelId = (_c = req.user.vendorDetails) === null || _c === void 0 ? void 0 : _c.hotel;
            if (userHotelId) {
                query.hotelId = userHotelId;
            }
            else {
                // If vendor/staff has no hotel, they should see no QR codes
                res.json({
                    success: true,
                    statusCode: 200,
                    message: `No QR Codes found for this ${req.user.role}`,
                    data: [],
                });
                return;
            }
        }
        else if (((_d = req.user) === null || _d === void 0 ? void 0 : _d.role) === "admin" && hotelId) {
            // If admin is querying for a specific hotel
            query.hotelId = hotelId;
        }
        const qrCodes = yield qrcode_model_1.QRCode.find(query)
            .populate("hotelId", "name")
            .sort({ createdAt: -1 });
        if (qrCodes.length === 0) {
            res.json({
                success: true,
                statusCode: 200,
                message: "No QR Codes found",
                data: [],
            });
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "QR Codes retrieved successfully",
            data: qrCodes,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllQRCodes = getAllQRCodes;
const getQRCodeById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const qrCode = yield qrcode_model_1.QRCode.findOne({
            _id: req.params.id,
            isDeleted: false,
        }).populate("hotelId", "name");
        if (!qrCode) {
            next(new appError_1.appError("QR Code not found", 404));
            return;
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "QR Code retrieved successfully",
            data: qrCode,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getQRCodeById = getQRCodeById;
const updateQRCodeById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const qrCodeId = req.params.id;
        const { tableNumber, hotelId, seatNumber } = req.body;
        // Validate input
        const validatedData = qrcode_validation_1.qrCodeValidation.parse({
            tableNumber,
            hotelId,
            seatNumber,
        });
        // Find the QR code to update
        const qrCodeToUpdate = yield qrcode_model_1.QRCode.findOne({
            _id: qrCodeId,
            isDeleted: false,
        });
        if (!qrCodeToUpdate) {
            next(new appError_1.appError("QR Code not found", 404));
            return;
        }
        // Check if hotel exists
        const hotel = yield hotel_model_1.Hotel.findOne({
            _id: validatedData.hotelId,
            isDeleted: false,
        });
        if (!hotel) {
            next(new appError_1.appError("Hotel not found", 404));
            return;
        }
        // If table number and hotel are the same, no need to update
        if (qrCodeToUpdate.tableNumber === validatedData.tableNumber &&
            qrCodeToUpdate.hotelId.toString() === validatedData.hotelId &&
            qrCodeToUpdate.seatNumber === validatedData.seatNumber) {
            res.json({
                success: true,
                statusCode: 200,
                message: "No changes to update",
                data: qrCodeToUpdate,
            });
            return;
        }
        // Check if a QR code for the new table number and hotel already exists
        const existingQRCodeWithNewData = yield qrcode_model_1.QRCode.findOne({
            tableNumber: validatedData.tableNumber,
            hotelId: validatedData.hotelId,
            isDeleted: false,
            _id: { $ne: qrCodeId },
        });
        if (existingQRCodeWithNewData) {
            next(new appError_1.appError(`QR Code for table ${validatedData.tableNumber} in ${hotel.name} already exists.`, 409));
            return;
        }
        // Generate new QR code data URL
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
        const qrData = `${frontendUrl}/hotel-details/${validatedData.hotelId}?table=${validatedData.tableNumber}&seats=${validatedData.seatNumber}`;
        // Generate QR code with logo
        const newQrCodeDataURL = yield generateQRCodeWithLogo(qrData);
        // Upload new QR code image to Cloudinary
        const newImageUrl = yield uploadToCloudinary(newQrCodeDataURL, validatedData.tableNumber, hotel.name);
        // Delete the old image from Cloudinary
        if (qrCodeToUpdate.qrCodeImage) {
            const oldImagePublicIdWithFolder = qrCodeToUpdate.qrCodeImage.substring(qrCodeToUpdate.qrCodeImage.indexOf("restaurant-qrcodes/"));
            const oldImagePublicId = oldImagePublicIdWithFolder.substring(0, oldImagePublicIdWithFolder.lastIndexOf("."));
            if (oldImagePublicId) {
                try {
                    yield cloudinary_1.cloudinary.uploader.destroy(oldImagePublicId);
                }
                catch (cloudinaryError) {
                    console.error("Failed to delete old image from Cloudinary:", cloudinaryError);
                }
            }
        }
        // Update the QR code in the database
        qrCodeToUpdate.tableNumber = validatedData.tableNumber;
        qrCodeToUpdate.hotelId = validatedData.hotelId;
        qrCodeToUpdate.seatNumber = validatedData.seatNumber;
        qrCodeToUpdate.qrCodeImage = newImageUrl;
        yield qrCodeToUpdate.save();
        // Populate hotel info for response
        yield qrCodeToUpdate.populate("hotelId", "name");
        res.json({
            success: true,
            statusCode: 200,
            message: "QR Code updated successfully",
            data: qrCodeToUpdate,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateQRCodeById = updateQRCodeById;
// Soft delete a QR Code
const deleteQRCodeById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const qrCode = yield qrcode_model_1.QRCode.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, { isDeleted: true }, { new: true }).populate("hotelId", "name");
        if (!qrCode) {
            return next(new appError_1.appError("QR Code not found or already deleted", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "QR Code deleted successfully",
            data: qrCode,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteQRCodeById = deleteQRCodeById;
const bookTableByScan = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { hotelId, tableNumber } = qrcode_validation_1.bookTableValidation.parse(req.body);
        const table = yield qrcode_model_1.QRCode.findOneAndUpdate({ hotelId, tableNumber, isDeleted: false }, { status: "booked" }, { new: true });
        if (!table) {
            return next(new appError_1.appError("Table not found for this hotel", 404));
        }
        res.json({
            success: true,
            statusCode: 200,
            message: "Table booked successfully",
            data: table,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.bookTableByScan = bookTableByScan;
