import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { categoryRouter } from "../modules/category/category.routes";
import { bannerRouter } from "../modules/banner/banner.routes";
import { cartRouter } from "../modules/cart/cart.routes";
import { orderRouter } from "../modules/order/order.routes";
import { aiRouter } from "../modules/ai/ai.routes";
import { contractRouter } from "../modules/contact/contract.routes";
import { saveCardRouter } from "../modules/savecard/savecard.routes";
import { faqRouter } from "../modules/faq/faq.routes";
import { privacyPolicyRouter } from "../modules/privacy-policy/privacy-policy.routes";
import { TermsConditionRouter } from "../modules/terms-condition/terms-condition.routes";
import { helpSupportRouter } from "../modules/help-support/help-support.routes";
import { blogRouter } from "../modules/blog/blog.routes";
import { uploadRouter } from "../modules/upload/upload.routes";
import { bookmarkRouter } from "../modules/bookmark/bookmark.routes";
import { couponRouter } from "../modules/coupon/coupon.routes";
import { reportRouter } from "../modules/report/report.routes";

const router = Router();
const moduleRoutes = [
  {
    path: "/auth",
    route: authRouter,
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
    path: "/save-cards",
    route: saveCardRouter,
  },

  {
    path: "/faqs",
    route: faqRouter,
  },

  {
    path: "/privacy-policy",
    route: privacyPolicyRouter,
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
    path: "/uploads",
    route: uploadRouter,
  },

  {
    path: "/bookmarks",
    route: bookmarkRouter,
  },

  {
    path: "/coupons",
    route: couponRouter,
  },
  {
    path: "/reports",
    route: reportRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
