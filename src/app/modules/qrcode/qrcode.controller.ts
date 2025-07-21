import { NextFunction, Request, Response } from "express";
import { QRCode } from "./qrcode.model";
import { Hotel } from "../hotel/hotel.model";
import { qrCodeValidation, bookTableValidation } from "./qrcode.validation";
import { appError } from "../../errors/appError";
import { cloudinary } from "../../config/cloudinary";
import QRCodeLib from "qrcode";
import { userInterface } from "../../middlewares/userInterface";
import { createCanvas, loadImage } from "canvas";

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (
  dataUrl: string,
  tableNumber: string,
  hotelName: string
) => {
  try {
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: "restaurant-qrcodes",
      public_id: `${hotelName}_table_${tableNumber}_${Date.now()}`,
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new appError("Failed to upload QR code to Cloudinary", 500);
  }
};

// Helper function to generate QR code with logo
const generateQRCodeWithLogo = async (data: string): Promise<string> => {
  try {
    // Generate QR code as PNG buffer
    const qrCodeBuffer = await QRCodeLib.toBuffer(data, {
      type: "png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Create canvas
    const canvas = createCanvas(300, 300);
    const ctx = canvas.getContext("2d");

    // Load QR code image onto canvas
    const qrImage = await loadImage(qrCodeBuffer);
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
      const logoPath =
        process.env.LOGO_PATH || "https://i.ibb.co/d4F1y3mZ/logo.png";
      const logoImage = await loadImage(logoPath);

      // Draw logo in center
      ctx.drawImage(
        logoImage,
        centerX - logoSize / 2,
        centerY - logoSize / 2,
        logoSize,
        logoSize
      );
    } catch (logoError) {
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
  } catch (error) {
    console.error("Error generating QR code with logo:", error);
    // Fallback to regular QR code
    return await QRCodeLib.toDataURL(data);
  }
};

export const createQRCode = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { tableNumber, hotelId, seatNumber } = req.body;

    // If user is a vendor, they can only create a QR code for their own hotel
    if (req.user?.role === "vendor") {
      const vendorHotelId = (req.user as any).vendorDetails?.hotel;
      if (!vendorHotelId || vendorHotelId.toString() !== hotelId) {
        return next(
          new appError("You can only create QR codes for your own hotel.", 403)
        );
      }
    }

    // Validate the input
    const validatedData = qrCodeValidation.parse({
      tableNumber,
      hotelId,
      seatNumber,
    });

    // Check if hotel exists
    const hotel = await Hotel.findOne({
      _id: validatedData.hotelId,
      isDeleted: false,
    });
    if (!hotel) {
      return next(new appError("Hotel not found", 404));
    }

    // Check if QR code for this table and hotel already exists
    const existingQRCode = await QRCode.findOne({
      tableNumber: validatedData.tableNumber,
      hotelId: validatedData.hotelId,
      isDeleted: false,
    });
    if (existingQRCode) {
      return next(
        new appError(
          `QR Code for table ${validatedData.tableNumber} in ${hotel.name} already exists.`,
          409
        )
      );
    }

    // Generate QR code data - you might want to encode a URL with hotel and table info
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    const qrData = `${frontendUrl}/hotel-details/${validatedData.hotelId}?table=${validatedData.tableNumber}&seats=${validatedData.seatNumber}`;

    // Generate QR code with logo
    const qrCodeDataURL = await generateQRCodeWithLogo(qrData);

    // Upload QR code image to Cloudinary
    const imageUrl = await uploadToCloudinary(
      qrCodeDataURL,
      validatedData.tableNumber,
      hotel.name
    );

    // Create a new QR code entry
    const qrCode = new QRCode({
      tableNumber: validatedData.tableNumber,
      hotelId: validatedData.hotelId,
      seatNumber: validatedData.seatNumber,
      qrCodeImage: imageUrl,
    });
    await qrCode.save();

    // Populate hotel info for response
    await qrCode.populate("hotelId", "name");

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "QR Code created successfully",
      data: qrCode,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllQRCodes = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const query: any = { isDeleted: false };
    const { hotelId } = req.query;

    // If the user is a vendor or staff, only show QR codes for their hotel
    if (req.user?.role === "vendor" || req.user?.role === "staff") {
      const userHotelId = (req.user as any).vendorDetails?.hotel;
      if (userHotelId) {
        query.hotelId = userHotelId;
      } else {
        // If vendor/staff has no hotel, they should see no QR codes
        res.json({
          success: true,
          statusCode: 200,
          message: `No QR Codes found for this ${req.user.role}`,
          data: [],
        });
        return;
      }
    } else if (req.user?.role === "admin" && hotelId) {
      // If admin is querying for a specific hotel
      query.hotelId = hotelId;
    }

    const qrCodes = await QRCode.find(query)
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
  } catch (error) {
    next(error);
  }
};

export const getQRCodeById = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const qrCode = await QRCode.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("hotelId", "name");

    if (!qrCode) {
      next(new appError("QR Code not found", 404));
      return;
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "QR Code retrieved successfully",
      data: qrCode,
    });
  } catch (error) {
    next(error);
  }
};

export const updateQRCodeById = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const qrCodeId = req.params.id;
    const { tableNumber, hotelId, seatNumber } = req.body;

    // Validate input
    const validatedData = qrCodeValidation.parse({
      tableNumber,
      hotelId,
      seatNumber,
    });

    // Find the QR code to update
    const qrCodeToUpdate = await QRCode.findOne({
      _id: qrCodeId,
      isDeleted: false,
    });

    if (!qrCodeToUpdate) {
      next(new appError("QR Code not found", 404));
      return;
    }

    // Check if hotel exists
    const hotel = await Hotel.findOne({
      _id: validatedData.hotelId,
      isDeleted: false,
    });
    if (!hotel) {
      next(new appError("Hotel not found", 404));
      return;
    }

    // If table number and hotel are the same, no need to update
    if (
      qrCodeToUpdate.tableNumber === validatedData.tableNumber &&
      qrCodeToUpdate.hotelId.toString() === validatedData.hotelId &&
      qrCodeToUpdate.seatNumber === validatedData.seatNumber
    ) {
      res.json({
        success: true,
        statusCode: 200,
        message: "No changes to update",
        data: qrCodeToUpdate,
      });
      return;
    }

    // Check if a QR code for the new table number and hotel already exists
    const existingQRCodeWithNewData = await QRCode.findOne({
      tableNumber: validatedData.tableNumber,
      hotelId: validatedData.hotelId,
      isDeleted: false,
      _id: { $ne: qrCodeId },
    });

    if (existingQRCodeWithNewData) {
      next(
        new appError(
          `QR Code for table ${validatedData.tableNumber} in ${hotel.name} already exists.`,
          409
        )
      );
      return;
    }

    // Generate new QR code data URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3001";
    const qrData = `${frontendUrl}/hotel-details/${validatedData.hotelId}?table=${validatedData.tableNumber}&seats=${validatedData.seatNumber}`;

    // Generate QR code with logo
    const newQrCodeDataURL = await generateQRCodeWithLogo(qrData);

    // Upload new QR code image to Cloudinary
    const newImageUrl = await uploadToCloudinary(
      newQrCodeDataURL,
      validatedData.tableNumber,
      hotel.name
    );

    // Delete the old image from Cloudinary
    if (qrCodeToUpdate.qrCodeImage) {
      const oldImagePublicIdWithFolder = qrCodeToUpdate.qrCodeImage.substring(
        qrCodeToUpdate.qrCodeImage.indexOf("restaurant-qrcodes/")
      );
      const oldImagePublicId = oldImagePublicIdWithFolder.substring(
        0,
        oldImagePublicIdWithFolder.lastIndexOf(".")
      );
      if (oldImagePublicId) {
        try {
          await cloudinary.uploader.destroy(oldImagePublicId);
        } catch (cloudinaryError) {
          console.error(
            "Failed to delete old image from Cloudinary:",
            cloudinaryError
          );
        }
      }
    }

    // Update the QR code in the database
    qrCodeToUpdate.tableNumber = validatedData.tableNumber;
    qrCodeToUpdate.hotelId = validatedData.hotelId as any;
    qrCodeToUpdate.seatNumber = validatedData.seatNumber;
    qrCodeToUpdate.qrCodeImage = newImageUrl;
    await qrCodeToUpdate.save();

    // Populate hotel info for response
    await qrCodeToUpdate.populate("hotelId", "name");

    res.json({
      success: true,
      statusCode: 200,
      message: "QR Code updated successfully",
      data: qrCodeToUpdate,
    });
  } catch (error) {
    next(error);
  }
};

// Soft delete a QR Code
export const deleteQRCodeById = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const qrCode = await QRCode.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    ).populate("hotelId", "name");

    if (!qrCode) {
      return next(new appError("QR Code not found or already deleted", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "QR Code deleted successfully",
      data: qrCode,
    });
  } catch (error) {
    next(error);
  }
};

export const bookTableByScan = async (
  req: userInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hotelId, tableNumber } = bookTableValidation.parse(req.body);

    const table = await QRCode.findOneAndUpdate(
      { hotelId, tableNumber, isDeleted: false },
      { status: "booked" },
      { new: true }
    );

    if (!table) {
      return next(new appError("Table not found for this hotel", 404));
    }

    res.json({
      success: true,
      statusCode: 200,
      message: "Table booked successfully",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};
