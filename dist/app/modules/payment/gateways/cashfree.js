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
exports.createCashfreeOrder = createCashfreeOrder;
exports.fetchCashfreeOrder = fetchCashfreeOrder;
exports.getReturnUrl = getReturnUrl;
const CF_API_VERSION = '2023-08-01';
const getCashfreeBaseUrl = () => {
    const env = (process.env.CASHFREE_ENV || 'sandbox').toLowerCase();
    return env === 'production' ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com';
};
const getHeaders = () => {
    const appId = process.env.CASHFREE_APP_ID || '';
    const secret = process.env.CASHFREE_SECRET_KEY || '';
    if (!appId || !secret) {
        throw new Error('Cashfree credentials missing. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY');
    }
    return {
        'x-client-id': appId,
        'x-client-secret': secret,
        'x-api-version': CF_API_VERSION,
        'Content-Type': 'application/json',
    };
};
function createCashfreeOrder(params) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const base = getCashfreeBaseUrl();
        const url = `${base}/pg/orders`;
        const body = {
            order_amount: Number(params.orderAmount),
            order_currency: (params.currency || 'INR').toUpperCase(),
            customer_details: {
                customer_id: params.customer.id,
                customer_name: params.customer.name || '',
                customer_email: params.customer.email || '',
                customer_phone: params.customer.phone || '',
            },
            order_meta: {
                return_url: params.returnUrl,
            },
            order_note: ((_a = params.notes) === null || _a === void 0 ? void 0 : _a.note) || '',
        };
        if (params.cfOrderId)
            body.order_id = params.cfOrderId;
        const res = yield fetch(url, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        const json = yield res.json().catch(() => ({}));
        if (!res.ok) {
            const msg = (json === null || json === void 0 ? void 0 : json.message) || (json === null || json === void 0 ? void 0 : json.error) || 'Cashfree order creation failed';
            throw new Error(msg);
        }
        return json; // contains order_id and payment_session_id
    });
}
function fetchCashfreeOrder(cfOrderId) {
    return __awaiter(this, void 0, void 0, function* () {
        const base = getCashfreeBaseUrl();
        const url = `${base}/pg/orders/${encodeURIComponent(cfOrderId)}`;
        const res = yield fetch(url, {
            method: 'GET',
            headers: getHeaders(),
        });
        const json = yield res.json().catch(() => ({}));
        if (!res.ok) {
            const msg = (json === null || json === void 0 ? void 0 : json.message) || (json === null || json === void 0 ? void 0 : json.error) || 'Cashfree fetch order failed';
            throw new Error(msg);
        }
        return json;
    });
}
function getReturnUrl(req, ourOrderId) {
    const base = process.env.WEB_BASE_URL || 'http://localhost:3000';
    const backendBase = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
    // Backend route will process and redirect to frontend order page
    return `${backendBase}/v1/api/payments/cashfree/return?our_order_id=${encodeURIComponent(ourOrderId)}&cf_order_id={order_id}`; // Cashfree replaces {order_id} in return
}
