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
exports.seedAdminStaff = void 0;
const admin_staff_model_1 = require("../modules/admin-staff/admin-staff.model");
const auth_model_1 = require("../modules/auth/auth.model");
const seedAdminStaff = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if admin staff already exists
        const existingAdminStaff = yield admin_staff_model_1.AdminStaff.findOne({ email: 'staff@airmenu.com' });
        if (existingAdminStaff) {
            console.log('Admin staff already exists');
            return;
        }
        // Find the main admin to set as creator
        const mainAdmin = yield auth_model_1.User.findOne({ role: 'admin' });
        if (!mainAdmin) {
            console.log('Main admin not found. Please create admin first.');
            return;
        }
        // Create sample admin staff with different permission levels
        const adminStaffMembers = [
            {
                name: 'John Manager',
                email: 'manager@airmenu.com',
                password: 'password123',
                phone: '9876543210',
                permissions: {
                    dashboard: true,
                    orders: true,
                    restaurants: true,
                    tableBookings: true,
                    vendorKyc: true,
                    categories: true,
                    banners: true,
                    exclusiveOffers: true,
                    featureOffers: true,
                    contacts: true,
                    pricing: true,
                    blog: true,
                    qrCodes: true,
                    faq: true,
                    privacyPolicy: true,
                    termsConditions: true,
                    helpSupport: true,
                },
                createdBy: mainAdmin._id,
                status: 'active'
            },
            {
                name: 'Sarah Orders',
                email: 'orders@airmenu.com',
                password: 'password123',
                phone: '9876543211',
                permissions: {
                    dashboard: true,
                    orders: true,
                    restaurants: true,
                    tableBookings: true,
                    vendorKyc: false,
                    categories: false,
                    banners: false,
                    exclusiveOffers: false,
                    featureOffers: false,
                    contacts: false,
                    pricing: false,
                    blog: false,
                    qrCodes: false,
                    faq: false,
                    privacyPolicy: false,
                    termsConditions: false,
                    helpSupport: false,
                },
                createdBy: mainAdmin._id,
                status: 'active'
            },
            {
                name: 'Mike Content',
                email: 'content@airmenu.com',
                password: 'password123',
                phone: '9876543212',
                permissions: {
                    dashboard: true,
                    orders: false,
                    restaurants: false,
                    tableBookings: false,
                    vendorKyc: false,
                    categories: true,
                    banners: true,
                    exclusiveOffers: true,
                    featureOffers: true,
                    contacts: true,
                    pricing: false,
                    blog: true,
                    qrCodes: false,
                    faq: true,
                    privacyPolicy: true,
                    termsConditions: true,
                    helpSupport: true,
                },
                createdBy: mainAdmin._id,
                status: 'active'
            }
        ];
        yield admin_staff_model_1.AdminStaff.insertMany(adminStaffMembers);
        console.log('Admin staff seeded successfully');
    }
    catch (error) {
        console.error('Error seeding admin staff:', error);
    }
});
exports.seedAdminStaff = seedAdminStaff;
