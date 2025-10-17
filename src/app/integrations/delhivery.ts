const DEFAULT_BASE = 'https://track.delhivery.com';

function getBaseUrl() {
  return process.env.DELHIVERY_BASE_URL || DEFAULT_BASE;
}

function getHeaders() {
  const token = process.env.DELHIVERY_API_TOKEN || '';
  if (!token) throw new Error('DELHIVERY_API_TOKEN not set');
  return {
    Authorization: `Token ${token}`,
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
  const shipment: any = {
    name: params.consignee.name,
    add: `${params.consignee.address1}${params.consignee.address2 ? ', ' + params.consignee.address2 : ''}`,
    city: params.consignee.city,
    state: params.consignee.state,
    pin: params.consignee.pincode,
    phone: params.consignee.phone || '',
    email: params.consignee.email || '',
    order: params.orderNumber,
    payment_mode: params.paymentMode,
    weight: Number(params.weightKg || 0.5),
    quantity: Number(params.quantity || 1),
    total_amount: Number(params.invoiceValue || 0),
    cod_amount: params.paymentMode === 'COD' ? Number(params.codAmount || params.invoiceValue || 0) : 0,
    pickup_location: params.pickup?.location || process.env.DELHIVERY_PICKUP_LOCATION || '',
    pickup_date: params.pickup?.date || new Date().toISOString().slice(0, 10),
    ...(params.pickup?.time ? { pickup_time: params.pickup.time } : {}),
    client: params.client || process.env.DELHIVERY_CLIENT || '',
  };

  const form = new URLSearchParams();
  form.set('format', 'json');
  form.set('data', JSON.stringify([shipment]));

  const res = await fetch(url, { method: 'POST', headers: getHeaders(), body: form as any });
  const text = await res.text();
  let json: any = {};
  try { json = JSON.parse(text); } catch (e) { json = {}; }
  if (!res.ok) {
    const msg = (json && (json.rmk || json.remarks || json.remark || json.message || json.error)) || text || 'Delhivery create shipment failed';
    throw new Error(msg);
  }
  return json && Object.keys(json).length ? json : text;
}

export async function delhiverySchedulePickup(args: { expectedPackageCount?: number; pickup?: { location?: string; date?: string; time?: string } }) {
  const base = getBaseUrl();
  const url = `${base}/fm/request/new/`;
  const form = new URLSearchParams();
  form.set('format', 'json');
  form.set('pickup_date', args.pickup?.date || new Date().toISOString().slice(0, 10));
  const slot = (() => {
    const s = args.pickup?.time || '';
    if (!s) return '1100-1500';
    // Accept HH:MM-HH:MM and convert to HHMM-HHMM
    if (/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(s)) {
      const [a, b] = s.split('-');
      return a.replace(':', '') + '-' + b.replace(':', '');
    }
    return s;
  })();
  form.set('pickup_time', slot);
  form.set('pickup_location', args.pickup?.location || process.env.DELHIVERY_PICKUP_LOCATION || '');
  form.set('expected_package_count', String(Number(args.expectedPackageCount || 1)));
  if (process.env.DELHIVERY_PICKUP_REMARKS) form.set('remarks', process.env.DELHIVERY_PICKUP_REMARKS);

  const res = await fetch(url, { method: 'POST', headers: getHeaders(), body: form as any });
  const text = await res.text();
  let json: any = {};
  try { json = JSON.parse(text); } catch {}
  if (!res.ok) {
    const msg = (json && (json.rmk || json.remarks || json.remark || json.message || json.error)) || text || 'Delhivery pickup request failed';
    throw new Error(msg);
  }
  return json && Object.keys(json).length ? json : text;
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
