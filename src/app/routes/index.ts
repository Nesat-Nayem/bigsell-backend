import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { categoryRouter } from "../modules/category/category.routes";
import { bannerRouter } from "../modules/banner/banner.routes";
import { contractRouter } from "../modules/contact/contract.routes";
import { faqRouter } from "../modules/faq/faq.routes";
import { privacyPolicyRouter } from "../modules/privacy-policy/privacy-policy.routes";
import { shippingPolicyRouter } from "../modules/shipping-policy/shipping-policy.routes";
import { paymentPolicyRouter } from "../modules/payment-policy/payment-policy.routes";
import { disclaimerRouter } from "../modules/disclaimer/disclaimer.routes";
import { siteSecurityRouter } from "../modules/site-security/site-security.routes";
import { TermsConditionRouter } from "../modules/terms-condition/terms-condition.routes";
import { helpSupportRouter } from "../modules/help-support/help-support.routes";
import { blogRouter } from "../modules/blog/blog.routes";
import { blogCategoryRouter } from "../modules/blog-category/blog-category.routes";
import { headerBannerRouter } from "../modules/header-banner/header-banner.routes";
import { discountOfferRouter } from "../modules/discount-offer/discount-offer.routes";
import { offerBannerRouter } from "../modules/offer-banner/offer-banner.routes";
import { uploadRouter } from "../modules/upload/upload.routes";
import { productRouter } from "../modules/product/product.routes";
import { cartRouter } from "../modules/cart/cart.routes";
import { vendorPolicyRouter } from "../modules/vendor-policy/vendor-policy.routes";
import { orderRouter } from "../modules/order/order.routes";
import { paymentRouter } from "../modules/payment/payment.routes";
import { wishlistRouter } from "../modules/wishlist/wishlist.routes";
import { aboutRouter } from "../modules/about/about.routes";
import { footerWidgetRouter } from "../modules/footer-widget/footer-widget.routes";
import { generalSettingsRouter } from "../modules/general-settings/general-settings.routes";
import { productCategoryRouter } from "../modules/Product-category/product-category.routes";
import { subscriptionRouter } from "../modules/subscription/subscription.routes";
import { subscriptionIncludeRouter } from "../modules/subscription-include/subscription-include.routes";
import { vendorRouter } from "../modules/vendor/vendor.routes";
import { addressRouter } from "../modules/address/address.routes";
import { couponRouter } from "../modules/coupon/coupon.routes";

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

  {
    path: "/offer-banners",
    route: offerBannerRouter,
  },

  {
    path: "/about",
    route: aboutRouter,
  },

  {
    path: "/footer-widgets",
    route: footerWidgetRouter,
  },

  {
    path: "/general-settings",
    route: generalSettingsRouter,
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
    path: "/shipping-policy",
    route: shippingPolicyRouter,
  },

  {
    path: "/payment-policy",
    route: paymentPolicyRouter,
  },

  {
    path: "/disclaimer",
    route: disclaimerRouter,
  },

  {
    path: "/site-security",
    route: siteSecurityRouter,
  },

  {
    path: "/vendor-policy",
    route: vendorPolicyRouter,
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
    path: "/upload",
    route: uploadRouter,
  },

  {
    path: "/products",
    route: productRouter,
  },
  {
    path: "/productsCategory",
    route: productCategoryRouter,
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
  {
    path: "/subscriptions",
    route: subscriptionRouter,
  },
  {
    path: "/subscription-includes",
    route: subscriptionIncludeRouter,
  },
  {
    path: "/vendors",
    route: vendorRouter,
  },
  {
    path: "/addresses",
    route: addressRouter,
  },
  {
    path: "/coupons",
    route: couponRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
