import type { Request } from 'express';

const DEFAULT_BASE = 'https://track.delhivery.com';

function getBaseUrl() {
  return process.env.DELHIVERY_BASE_URL || DEFAULT_BASE;
}

function getHeaders() {
  const token = process.env.DELHIVERY_API_TOKEN || '';
  if (!token) throw new Error('DELHIVERY_API_TOKEN not set');
  return {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  } as Record<string, string>;
}

export type CreateShipmentParams = {
  orderId: string;
  orderNumber: string;
  consignee: {
    name: string;
    phone?: string;
    email?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
  };
  paymentMode: 'Prepaid' | 'COD';
  invoiceValue: number;
  codAmount?: number;
  weightKg?: number; // total weight
  quantity?: number; // total boxes
  client?: string; // client code if required
  pickup?: {
    location?: string;
    date?: string; // YYYY-MM-DD
    time?: string; // HH:mm
  };
};

export async function delhiveryCreateShipment(params: CreateShipmentParams) {
  const base = getBaseUrl();
  const url = `${base}/api/cmu/create.json`;
  const body: any = {
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
        pickup_location: params.pickup?.location || process.env.DELHIVERY_PICKUP_LOCATION || '',
        pickup_date: params.pickup?.date || new Date().toISOString().slice(0, 10),
        pickup_time: params.pickup?.time || undefined,
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

  const res = await fetch(url, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json && (json.message || json.error)) || 'Delhivery create shipment failed';
    throw new Error(msg);
  }
  return json;
}

export async function delhiverySchedulePickup(args: { expectedPackageCount?: number; pickup?: { location?: string; date?: string; time?: string } }) {
  const base = getBaseUrl();
  const url = `${base}/fm/request/new`;
  const body: any = {
    pickup_time: args.pickup?.time,
    pickup_date: args.pickup?.date || new Date().toISOString().slice(0, 10),
    pickup_location: args.pickup?.location || process.env.DELHIVERY_PICKUP_LOCATION || '',
    expected_package_count: Number(args.expectedPackageCount || 1),
  };
  const res = await fetch(url, { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json && (json.message || json.error)) || 'Delhivery pickup request failed';
    throw new Error(msg);
  }
  return json;
}

export async function delhiveryTrack(waybill: string) {
  const base = getBaseUrl();
  const url = `${base}/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}`;
  const res = await fetch(url, { headers: getHeaders() });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (json && (json.message || json.error)) || 'Delhivery tracking fetch failed';
    throw new Error(msg);
  }
  return json;
}

export async function delhiveryLabel(waybills: string[]) {
  // Some accounts use /api/p/print/leaf?wbns=... to fetch label PDF
  const base = getBaseUrl();
  const url = `${base}/api/p/print/leaf?wbns=${encodeURIComponent(waybills.join(','))}`;
  const res = await fetch(url, { headers: getHeaders() });
  const buf = await res.arrayBuffer();
  if (!res.ok) {
    throw new Error('Delhivery label fetch failed');
  }
  const base64 = Buffer.from(buf).toString('base64');
  return { pdfBase64: base64 };
}
