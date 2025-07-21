"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = require("../modules/auth/auth.routes");
const category_routes_1 = require("../modules/category/category.routes");
const banner_routes_1 = require("../modules/banner/banner.routes");
const cart_routes_1 = require("../modules/cart/cart.routes");
const order_routes_1 = require("../modules/order/order.routes");
const ai_routes_1 = require("../modules/ai/ai.routes");
const table_routes_1 = require("../modules/table/table.routes");
const payment_routes_1 = require("../modules/payment/payment.routes");
const contract_routes_1 = require("../modules/contact/contract.routes");
const hotel_routes_1 = require("../modules/hotel/hotel.routes");
const kyc_routes_1 = require("../modules/kyc/kyc.routes");
const savecard_routes_1 = require("../modules/savecard/savecard.routes");
const faq_routes_1 = require("../modules/faq/faq.routes");
const offer_routes_1 = require("../modules/offer/offer.routes");
const privacy_policy_routes_1 = require("../modules/privacy-policy/privacy-policy.routes");
const table_booking_routes_1 = require("../modules/table-booking/table-booking.routes");
const feature_offer_routes_1 = require("../modules/feature-offer/feature-offer.routes");
const terms_condition_routes_1 = require("../modules/terms-condition/terms-condition.routes");
const help_support_routes_1 = require("../modules/help-support/help-support.routes");
const blog_routes_1 = require("../modules/blog/blog.routes");
const musttry_routes_1 = require("../modules/musttry/musttry.routes");
const upload_routes_1 = require("../modules/upload/upload.routes");
const staff_routes_1 = require("../modules/staff/staff.routes");
const staff_order_routes_1 = require("../modules/staff/staff.order.routes");
const pricing_routes_1 = require("../modules/pricing/pricing.routes");
const hotel_booking_settings_routes_1 = require("../modules/hotel-booking-settings/hotel-booking-settings.routes");
const bookmark_routes_1 = require("../modules/bookmark/bookmark.routes");
const qrcode_routes_1 = require("../modules/qrcode/qrcode.routes");
const admin_staff_routes_1 = require("../modules/admin-staff/admin-staff.routes");
const coupon_routes_1 = require("../modules/coupon/coupon.routes");
const report_routes_1 = require("../modules/report/report.routes");
const activity_routes_1 = __importDefault(require("../modules/activity/activity.routes"));
const places_routes_1 = require("../modules/places/places.routes");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_routes_1.authRouter,
    },
    {
        path: "/activities",
        route: activity_routes_1.default,
    },
    {
        path: "/categories",
        route: category_routes_1.categoryRouter,
    },
    {
        path: "/contracts",
        route: contract_routes_1.contractRouter,
    },
    {
        path: "/banners",
        route: banner_routes_1.bannerRouter,
    },
    {
        path: "/qrcodes",
        route: qrcode_routes_1.qrcodeRouter,
    },
    {
        path: "/cart",
        route: cart_routes_1.cartRouter,
    },
    {
        path: "/orders",
        route: order_routes_1.orderRouter,
    },
    {
        path: "/ai",
        route: ai_routes_1.aiRouter,
    },
    {
        path: "/qr-scanner",
        route: table_routes_1.tableRouter,
    },
    {
        path: "/payments",
        route: payment_routes_1.paymentRouter,
    },
    {
        path: "/hotels",
        route: hotel_routes_1.hotelRouter,
    },
    {
        path: "/kyc",
        route: kyc_routes_1.kycRouter,
    },
    {
        path: "/save-cards",
        route: savecard_routes_1.saveCardRouter,
    },
    {
        path: "/faqs",
        route: faq_routes_1.faqRouter,
    },
    {
        path: "/offers",
        route: offer_routes_1.offerRouter,
    },
    {
        path: "/privacy-policy",
        route: privacy_policy_routes_1.privacyPolicyRouter,
    },
    {
        path: "/table-bookings",
        route: table_booking_routes_1.tableBookingRouter,
    },
    {
        path: "/feature-offers",
        route: feature_offer_routes_1.featureOfferRouter,
    },
    {
        path: "/terms-conditions",
        route: terms_condition_routes_1.TermsConditionRouter,
    },
    {
        path: "/help-support",
        route: help_support_routes_1.helpSupportRouter,
    },
    {
        path: "/blogs",
        route: blog_routes_1.blogRouter,
    },
    {
        path: "/must-try",
        route: musttry_routes_1.mustTryRouter,
    },
    {
        path: "/uploads",
        route: upload_routes_1.uploadRouter,
    },
    {
        path: "/staff",
        route: staff_routes_1.staffRouter,
    },
    {
        path: "/staff-orders",
        route: staff_order_routes_1.staffOrderRouter,
    },
    {
        path: "/pricing",
        route: pricing_routes_1.pricingRouter,
    },
    {
        path: "/hotel-booking-settings",
        route: hotel_booking_settings_routes_1.hotelBookingSettingsRouter,
    },
    {
        path: "/bookmarks",
        route: bookmark_routes_1.bookmarkRouter,
    },
    {
        path: "/admin-staff",
        route: admin_staff_routes_1.adminStaffRouter,
    },
    {
        path: "/coupons",
        route: coupon_routes_1.couponRouter,
    },
    {
        path: "/reports",
        route: report_routes_1.reportRouter,
    },
    {
        path: "/places",
        route: places_routes_1.placesRouter,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
