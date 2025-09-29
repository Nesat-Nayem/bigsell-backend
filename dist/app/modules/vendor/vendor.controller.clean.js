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
            const generatedPassword = crypto_1.default.randomBytes(6).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
            let user = yield auth_model_1.User.findOne({ email: doc.email });
            if (!user) {
                user = new auth_model_1.User({
                    name: doc.vendorName,
                    email: doc.email,
                    phone: doc.phone,
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
            try {
                yield (0, mailService_1.sendMail)({
                    to: doc.email,
                    subject: 'Your Vendor Account has been approved',
                    html: `<p>Dear ${doc.vendorName},</p>
<p>Your KYC has been approved. You can now login using the following credentials:</p>
<p><strong>Email:</strong> ${doc.email}<br/>
<strong>Password:</strong> ${generatedPassword}</p>
<p>Please login and change your password immediately.</p>
<p>Regards,<br/>Support Team</p>`,
                });
                doc.credentialSent = true;
            }
            catch (mailErr) {
                console.error('Email send failed:', mailErr);
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
