import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { categoryRouter } from "../modules/category/category.routes";
import { bannerRouter } from "../modules/banner/banner.routes";
import { cartRouter } from "../modules/cart/cart.routes";
import { orderRouter } from "../modules/order/order.routes";
import { aiRouter } from "../modules/ai/ai.routes";
import { tableRouter } from "../modules/table/table.routes";
import { paymentRouter } from "../modules/payment/payment.routes";
import { contractRouter } from "../modules/contact/contract.routes";
import { hotelRouter } from "../modules/hotel/hotel.routes";
import { kycRouter } from "../modules/kyc/kyc.routes";
import { saveCardRouter } from "../modules/savecard/savecard.routes";
import { faqRouter } from "../modules/faq/faq.routes";
import { offerRouter } from "../modules/offer/offer.routes";
import { privacyPolicyRouter } from "../modules/privacy-policy/privacy-policy.routes";
import { tableBookingRouter } from "../modules/table-booking/table-booking.routes";
import { featureOfferRouter } from "../modules/feature-offer/feature-offer.routes";
import { TermsConditionRouter } from "../modules/terms-condition/terms-condition.routes";
import { helpSupportRouter } from "../modules/help-support/help-support.routes";
import { blogRouter } from "../modules/blog/blog.routes";
import { mustTryRouter } from "../modules/musttry/musttry.routes";
import { uploadRouter } from "../modules/upload/upload.routes";
import { staffRouter } from "../modules/staff/staff.routes";
import { staffOrderRouter } from "../modules/staff/staff.order.routes";
import { pricingRouter } from "../modules/pricing/pricing.routes";
import { hotelBookingSettingsRouter } from "../modules/hotel-booking-settings/hotel-booking-settings.routes";
import { bookmarkRouter } from "../modules/bookmark/bookmark.routes";
import { qrcodeRouter } from "../modules/qrcode/qrcode.routes";
import { adminStaffRouter } from "../modules/admin-staff/admin-staff.routes";
import { couponRouter } from "../modules/coupon/coupon.routes";
import { reportRouter } from "../modules/report/report.routes";
import activityRouter from "../modules/activity/activity.routes";
import { placesRouter } from "../modules/places/places.routes";

const router = Router();
const moduleRoutes = [
  {
    path: "/auth",
    route: authRouter,
  },

  {
    path: "/activities",
    route: activityRouter,
  },

  {
    path: "/categories",
    route: categoryRouter,
  },

  {
    path: "/contracts",
    route: contractRouter,
  },

  {
    path: "/banners",
    route: bannerRouter,
  },

  {
    path: "/qrcodes",
    route: qrcodeRouter,
  },

  {
    path: "/cart",
    route: cartRouter,
  },
  {
    path: "/orders",
    route: orderRouter,
  },
  {
    path: "/ai",
    route: aiRouter,
  },
  {
    path: "/qr-scanner",
    route: tableRouter,
  },

  {
    path: "/payments",
    route: paymentRouter,
  },

  {
    path: "/hotels",
    route: hotelRouter,
  },

  {
    path: "/kyc",
    route: kycRouter,
  },

  {
    path: "/save-cards",
    route: saveCardRouter,
  },

  {
    path: "/faqs",
    route: faqRouter,
  },

  {
    path: "/offers",
    route: offerRouter,
  },

  {
    path: "/privacy-policy",
    route: privacyPolicyRouter,
  },

  {
    path: "/table-bookings",
    route: tableBookingRouter,
  },
  {
    path: "/feature-offers",
    route: featureOfferRouter,
  },

  {
    path: "/terms-conditions",
    route: TermsConditionRouter,
  },

  {
    path: "/help-support",
    route: helpSupportRouter,
  },

  {
    path: "/blogs",
    route: blogRouter,
  },

  {
    path: "/must-try",
    route: mustTryRouter,
  },

  {
    path: "/uploads",
    route: uploadRouter,
  },

  {
    path: "/staff",
    route: staffRouter,
  },
  {
    path: "/staff-orders",
    route: staffOrderRouter,
  },
  {
    path: "/pricing",
    route: pricingRouter,
  },

  {
    path: "/hotel-booking-settings",
    route: hotelBookingSettingsRouter,
  },
  {
    path: "/bookmarks",
    route: bookmarkRouter,
  },
  {
    path: "/admin-staff",
    route: adminStaffRouter,
  },

  {
    path: "/coupons",
    route: couponRouter,
  },
  {
    path: "/reports",
    route: reportRouter,
  },
  {
    path: "/places",
    route: placesRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
