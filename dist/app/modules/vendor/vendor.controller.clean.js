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
exports.deleteVendor = exports.updateKycStatus = exports.updateVendor = exports.getVendorById = exports.getVendors = exports.applyVendor = void 0;
const vendor_model_1 = require("./vendor.model");
const vendor_validation_1 = require("./vendor.validation");
const appError_1 = require("../../errors/appError");
const subscription_model_1 = require("../subscription/subscription.model");
const auth_model_1 = require("../auth/auth.model");
const crypto_1 = __importDefault(require("crypto"));
const mailService_1 = require("../../services/mailService");
const applyVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const parsed = vendor_validation_1.vendorApplyValidation.parse(req.body);
        let planName = parsed.planName;
        let planPrice = parsed.planPrice;
        let planBillingCycle = parsed.planBillingCycle;
        let planColor = parsed.planColor;
        let subscriptionId = parsed.subscriptionId;
        if (subscriptionId) {
            const sub = yield subscription_model_1.Subscription.findOne({ _id: subscriptionId, isDeleted: false });
            if (sub) {
                planName = sub.name;
                planPrice = sub.price;
                planBillingCycle = sub.billingCycle;
                planColor = sub.color;
            }
        }
        const doc = yield vendor_model_1.VendorApplication.create({
            vendorName: parsed.vendorName,
            email: parsed.email,
            phone: parsed.phone,
            address: parsed.address,
            gstNo: parsed.gstNo,
            subscriptionId,
            planName,
            planPrice,
            planBillingCycle,
            planColor,
            aadharUrl: parsed.aadharUrl,
            panUrl: parsed.panUrl,
            paymentStatus: (_a = parsed.paymentStatus) !== null && _a !== void 0 ? _a : 'pending',
            paymentAmount: parsed.paymentAmount,
            kycStatus: 'pending',
        });
        res.json({ success: true, statusCode: 200, message: 'Application submitted', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.applyVendor = applyVendor;
const getVendors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, page, limit, kycStatus } = req.query;
        const filter = { isDeleted: false };
        if (kycStatus)
            filter.kycStatus = kycStatus;
        if (search) {
            const s = String(search);
            filter.$or = [
                { vendorName: { $regex: s, $options: 'i' } },
                { email: { $regex: s, $options: 'i' } },
                { phone: { $regex: s, $options: 'i' } },
                { gstNo: { $regex: s, $options: 'i' } },
            ];
        }
        const sort = { createdAt: -1 };
        const limitNum = limit ? parseInt(limit) : undefined;
        const pageNum = page ? parseInt(page) : undefined;
        if (pageNum && limitNum) {
            const skip = (Math.max(1, pageNum) - 1) * Math.max(1, limitNum);
            const [items, total] = yield Promise.all([
                vendor_model_1.VendorApplication.find(filter).sort(sort).skip(skip).limit(limitNum),
                vendor_model_1.VendorApplication.countDocuments(filter),
            ]);
            return res.json({
                success: true,
                statusCode: 200,
                message: 'Vendors retrieved',
                data: items,
                meta: {
                    total,
                    page: Math.max(1, pageNum),
                    limit: Math.max(1, limitNum),
                    totalPages: Math.ceil(total / Math.max(1, limitNum)) || 1,
                },
            });
        }
        const items = yield vendor_model_1.VendorApplication.find(filter).sort(sort);
        return res.json({ success: true, statusCode: 200, message: 'Vendors retrieved', data: items });
    }
    catch (error) {
        next(error);
    }
});
exports.getVendors = getVendors;
const getVendorById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield vendor_model_1.VendorApplication.findOne({ _id: req.params.id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Vendor application not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Vendor retrieved', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.getVendorById = getVendorById;
const updateVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = vendor_validation_1.vendorUpdateValidation.parse(req.body);
        const doc = yield vendor_model_1.VendorApplication.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, parsed, { new: true });
        if (!doc)
            return next(new appError_1.appError('Vendor application not found', 404));
        res.json({ success: true, statusCode: 200, message: 'Vendor updated', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.updateVendor = updateVendor;
const updateKycStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsed = vendor_validation_1.vendorUpdateStatusValidation.parse(req.body);
        const doc = yield vendor_model_1.VendorApplication.findOne({ _id: req.params.id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Vendor application not found', 404));
        doc.kycStatus = parsed.kycStatus;
        if (parsed.kycStatus === 'approved' && !doc.credentialSent) {
            const generatedPassword = crypto_1.default
                .randomBytes(6)
                .toString('base64')
                .replace(/[^a-zA-Z0-9]/g, '')
                .slice(0, 10);
            // Find existing user by email OR phone to avoid duplicate key errors
            let user = yield auth_model_1.User.findOne({
                $or: [
                    ...(doc.email ? [{ email: doc.email }] : []),
                    ...(doc.phone ? [{ phone: doc.phone }] : []),
                ],
            });
            if (!user) {
                user = new auth_model_1.User({
                    name: doc.vendorName,
                    email: doc.email,
                    phone: doc.phone, // phone is unique and required in schema
                    password: generatedPassword,
                    role: 'vendor',
                    status: 'active',
                });
            }
            else {
                ;
                user.role = 'vendor';
                user.password = generatedPassword;
                user.status = 'active';
            }
            yield user.save();
            doc.vendorUserId = user._id;
            // Send credentials via email if email exists
            if (doc.email) {
                try {
                    yield (0, mailService_1.sendMail)({
                        to: doc.email,
                        subject: '🎉 Welcome to BigSell - Your Vendor Account is Approved!',
                        html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vendor Account Approved</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8f9fa;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 Congratulations!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Your vendor account has been approved</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">Dear ${doc.vendorName},</h2>
            
            <p style="margin: 0 0 25px 0; font-size: 16px; color: #555;">
                Great news! Your KYC verification has been <strong style="color: #28a745;">successfully approved</strong>. 
                You can now start selling your products on our platform and manage your inventory through our vendor portal.
            </p>
            
            <!-- Credentials Box -->
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 4px solid #007bff;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">🔐 Your Login Credentials</h3>
                <div style="background: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid #dee2e6;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Access your vendor dashboard at:</p>
                    <p style="margin: 0 0 20px 0;">
                        <a href="https://bigselladmin.atpuae.com/" 
                           style="display: inline-block; background: linear-gradient(135deg, #007bff, #0056b3); color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-weight: 600; font-size: 16px;">
                            🚀 Open Vendor Dashboard
                        </a>
                    </p>
                    <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                        <div style="flex: 1; min-width: 200px;">
                            <p style="margin: 0 0 5px 0; font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Email Address</p>
                            <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 16px; font-weight: 600; color: #333; background: #f8f9fa; padding: 8px 12px; border-radius: 4px; border: 1px solid #dee2e6;">${doc.email}</p>
                        </div>
                        <div style="flex: 1; min-width: 200px;">
                            <p style="margin: 0 0 5px 0; font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">Temporary Password</p>
                            <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 16px; font-weight: 600; color: #333; background: #fff3cd; padding: 8px 12px; border-radius: 4px; border: 1px solid #ffeaa7;">${generatedPassword}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Security Notice -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #856404; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">🔒 Important Security Notice</h4>
                <p style="color: #856404; margin: 0; font-size: 14px;">
                    For your security, please <strong>change your password immediately</strong> after your first login. 
                    This temporary password should not be shared with anyone.
                </p>
            </div>
            
            <!-- Next Steps -->
            <div style="margin: 30px 0;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📋 Next Steps</h3>
                <ul style="margin: 0; padding-left: 20px; color: #555;">
                    <li style="margin-bottom: 8px;">Login to your vendor dashboard using the credentials above</li>
                    <li style="margin-bottom: 8px;">Change your password in the profile settings</li>
                    <li style="margin-bottom: 8px;">Complete your store setup and add your first products</li>
                    <li style="margin-bottom: 8px;">Start selling and track your orders through the dashboard</li>
                </ul>
            </div>
            
            <!-- Support -->
            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Need help getting started?</p>
                <p style="margin: 0;">
                    <a href="mailto:support@bigsell.com" style="color: #007bff; text-decoration: none; font-weight: 600;">📧 Contact Support</a>
                    <span style="color: #666; margin: 0 10px;">|</span>
                    <a href="tel:+919472210440" style="color: #007bff; text-decoration: none; font-weight: 600;">📞 +91 94722 10440</a>
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #dee2e6;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                Welcome to the <strong style="color: #007bff;">BigSell</strong> vendor family! 
            </p>
            <p style="margin: 0; color: #999; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
            </p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                <p style="margin: 0; color: #999; font-size: 12px;">
                    © 2025 BigSell. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`,
                    });
                    doc.credentialSent = true;
                }
                catch (mailErr) {
                    console.error('Email send failed:', mailErr);
                }
            }
        }
        yield doc.save();
        res.json({ success: true, statusCode: 200, message: 'KYC status updated', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.updateKycStatus = updateKycStatus;
const deleteVendor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doc = yield vendor_model_1.VendorApplication.findOne({ _id: req.params.id, isDeleted: false });
        if (!doc)
            return next(new appError_1.appError('Vendor application not found', 404));
        doc.isDeleted = true;
        yield doc.save();
        res.json({ success: true, statusCode: 200, message: 'Vendor deleted', data: doc });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteVendor = deleteVendor;
