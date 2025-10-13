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
exports.delhiveryCreateShipment = delhiveryCreateShipment;
exports.delhiverySchedulePickup = delhiverySchedulePickup;
exports.delhiveryTrack = delhiveryTrack;
exports.delhiveryLabel = delhiveryLabel;
const DEFAULT_BASE = 'https://track.delhivery.com';
function getBaseUrl() {
    return process.env.DELHIVERY_BASE_URL || DEFAULT_BASE;
}
function getHeaders() {
    const token = process.env.DELHIVERY_API_TOKEN || '';
    if (!token)
        throw new Error('DELHIVERY_API_TOKEN not set');
    return {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
    };
}
function delhiveryCreateShipment(params) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const base = getBaseUrl();
        const url = `${base}/api/cmu/create.json`;
        const body = {
            format: 'json',
            data: [
                {
                    consignee: params.consignee.name,
                    consignee_address: `${params.consignee.address1}${params.consignee.address2 ? ', ' + params.consignee.address2 : ''}`,
                    consignee_city: params.consignee.city,
                    consignee_state: params.consignee.state,
                    consignee_pincode: params.consignee.pincode,
                    consignee_phone: params.consignee.phone || '',
                    consignee_email: params.consignee.email || '',
                    pickup_location: ((_a = params.pickup) === null || _a === void 0 ? void 0 : _a.location) || process.env.DELHIVERY_PICKUP_LOCATION || '',
                    pickup_date: ((_b = params.pickup) === null || _b === void 0 ? void 0 : _b.date) || new Date().toISOString().slice(0, 10),
                    pickup_time: ((_c = params.pickup) === null || _c === void 0 ? void 0 : _c.time) || undefined,
                    client: params.client || process.env.DELHIVERY_CLIENT || '',
                    order: params.orderNumber,
                    payment_mode: params.paymentMode,
                    product_ttl_ms: 0,
                    weight: Number(params.weightKg || 0.5),
                    quantity: Number(params.quantity || 1),
                    invoice_value: Number(params.invoiceValue || 0),
                    cod_amount: params.paymentMode === 'COD' ? Number(params.codAmount || params.invoiceValue || 0) : 0,
                },
            ],
        };
        const res = yield fetch(url, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
        const json = yield res.json().catch(() => ({}));
        if (!res.ok) {
            const msg = (json && (json.message || json.error)) || 'Delhivery create shipment failed';
            throw new Error(msg);
        }
        return json;
    });
}
function delhiverySchedulePickup(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const base = getBaseUrl();
        const url = `${base}/fm/request/new`;
        const body = {
            pickup_time: (_a = args.pickup) === null || _a === void 0 ? void 0 : _a.time,
            pickup_date: ((_b = args.pickup) === null || _b === void 0 ? void 0 : _b.date) || new Date().toISOString().slice(0, 10),
            pickup_location: ((_c = args.pickup) === null || _c === void 0 ? void 0 : _c.location) || process.env.DELHIVERY_PICKUP_LOCATION || '',
            expected_package_count: Number(args.expectedPackageCount || 1),
        };
        const res = yield fetch(url, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
        const json = yield res.json().catch(() => ({}));
        if (!res.ok) {
            const msg = (json && (json.message || json.error)) || 'Delhivery pickup request failed';
            throw new Error(msg);
        }
        return json;
    });
}
function delhiveryTrack(waybill) {
    return __awaiter(this, void 0, void 0, function* () {
        const base = getBaseUrl();
        const url = `${base}/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}`;
        const res = yield fetch(url, { headers: getHeaders() });
        const json = yield res.json().catch(() => ({}));
        if (!res.ok) {
            const msg = (json && (json.message || json.error)) || 'Delhivery tracking fetch failed';
            throw new Error(msg);
        }
        return json;
    });
}
function delhiveryLabel(waybills) {
    return __awaiter(this, void 0, void 0, function* () {
        // Some accounts use /api/p/print/leaf?wbns=... to fetch label PDF
        const base = getBaseUrl();
        const url = `${base}/api/p/print/leaf?wbns=${encodeURIComponent(waybills.join(','))}`;
        const res = yield fetch(url, { headers: getHeaders() });
        const buf = yield res.arrayBuffer();
        if (!res.ok) {
            throw new Error('Delhivery label fetch failed');
        }
        const base64 = Buffer.from(buf).toString('base64');
        return { pdfBase64: base64 };
    });
}
