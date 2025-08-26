import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { categoryRouter } from "../modules/category/category.routes";
import { bannerRouter } from "../modules/banner/banner.routes";
import { contractRouter } from "../modules/contact/contract.routes";
// import { saveCardRouter } from "../modules/savecard/savecard.routes";
import { faqRouter } from "../modules/faq/faq.routes";
import { privacyPolicyRouter } from "../modules/privacy-policy/privacy-policy.routes";
import { TermsConditionRouter } from "../modules/terms-condition/terms-condition.routes";
import { helpSupportRouter } from "../modules/help-support/help-support.routes";
import { blogRouter } from "../modules/blog/blog.routes";
import { blogCategoryRouter } from "../modules/blog-category/blog-category.routes";
import { headerBannerRouter } from "../modules/header-banner/header-banner.routes";
import { discountOfferRouter } from "../modules/discount-offer/discount-offer.routes";
import { uploadRouter } from "../modules/upload/upload.routes";
import { productRouter } from "../modules/product/product.routes";
import { cartRouter } from "../modules/cart/cart.routes";
import { orderRouter } from "../modules/order/order.routes";
import { paymentRouter } from "../modules/payment/payment.routes";
import { wishlistRouter } from "../modules/wishlist/wishlist.routes";

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
    path: "/header-banners",
    route: headerBannerRouter,
  },

  {
    path: "/discount-offers",
    route: discountOfferRouter,
  },

  // {
  //   path: "/save-cards",
  //   route: saveCardRouter,
  // },

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
    path: "/blog-categories",
    route: blogCategoryRouter,
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
    path: "/products",
    route: productRouter,
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
    path: "/payments",
    route: paymentRouter,
  },

  {
    path: "/wishlist",
    route: wishlistRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
