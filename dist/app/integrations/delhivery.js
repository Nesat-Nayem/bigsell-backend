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
    };
}
function delhiveryCreateShipment(params) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const base = getBaseUrl();
        const url = `${base}/api/cmu/create.json`;
        const shipment = Object.assign(Object.assign({ name: params.consignee.name, add: `${params.consignee.address1}${params.consignee.address2 ? ', ' + params.consignee.address2 : ''}`, city: params.consignee.city, state: params.consignee.state, pin: params.consignee.pincode, phone: params.consignee.phone || '', email: params.consignee.email || '', order: params.orderNumber, payment_mode: params.paymentMode, weight: Number(params.weightKg || 0.5), quantity: Number(params.quantity || 1), total_amount: Number(params.invoiceValue || 0), cod_amount: params.paymentMode === 'COD' ? Number(params.codAmount || params.invoiceValue || 0) : 0, pickup_location: ((_a = params.pickup) === null || _a === void 0 ? void 0 : _a.location) || process.env.DELHIVERY_PICKUP_LOCATION || '', pickup_date: ((_b = params.pickup) === null || _b === void 0 ? void 0 : _b.date) || new Date().toISOString().slice(0, 10) }, (((_c = params.pickup) === null || _c === void 0 ? void 0 : _c.time) ? { pickup_time: params.pickup.time } : {})), { client: params.client || process.env.DELHIVERY_CLIENT || '' });
        const form = new URLSearchParams();
        form.set('format', 'json');
        form.set('data', JSON.stringify([shipment]));
        const res = yield fetch(url, { method: 'POST', headers: getHeaders(), body: form });
        const text = yield res.text();
        let json = {};
        try {
            json = JSON.parse(text);
        }
        catch (e) {
            json = {};
        }
        if (!res.ok) {
            const msg = (json && (json.rmk || json.remarks || json.remark || json.message || json.error)) || text || 'Delhivery create shipment failed';
            throw new Error(msg);
        }
        return json && Object.keys(json).length ? json : text;
    });
}
function delhiverySchedulePickup(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const base = getBaseUrl();
        const url = `${base}/fm/request/new/`;
        const form = new URLSearchParams();
        form.set('format', 'json');
        form.set('pickup_date', ((_a = args.pickup) === null || _a === void 0 ? void 0 : _a.date) || new Date().toISOString().slice(0, 10));
        const slot = (() => {
            var _a;
            const s = ((_a = args.pickup) === null || _a === void 0 ? void 0 : _a.time) || '';
            if (!s)
                return '1100-1500';
            // Accept HH:MM-HH:MM and convert to HHMM-HHMM
            if (/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(s)) {
                const [a, b] = s.split('-');
                return a.replace(':', '') + '-' + b.replace(':', '');
            }
            return s;
        })();
        form.set('pickup_time', slot);
        form.set('pickup_location', ((_b = args.pickup) === null || _b === void 0 ? void 0 : _b.location) || process.env.DELHIVERY_PICKUP_LOCATION || '');
        form.set('expected_package_count', String(Number(args.expectedPackageCount || 1)));
        if (process.env.DELHIVERY_PICKUP_REMARKS)
            form.set('remarks', process.env.DELHIVERY_PICKUP_REMARKS);
        const res = yield fetch(url, { method: 'POST', headers: getHeaders(), body: form });
        const text = yield res.text();
        let json = {};
        try {
            json = JSON.parse(text);
        }
        catch (_c) { }
        if (!res.ok) {
            const msg = (json && (json.rmk || json.remarks || json.remark || json.message || json.error)) || text || 'Delhivery pickup request failed';
            throw new Error(msg);
        }
        return json && Object.keys(json).length ? json : text;
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
