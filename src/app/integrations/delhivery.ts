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
  
  // Clean special characters that Delhivery doesn't accept: &, #, %, ;, \
  const cleanString = (s: string) => String(s || '').replace(/[&#%;\\]/g, '');
  const cleanPhone = (p: string) => String(p || '').replace(/\D/g, ''); // Keep only digits
  
  const shipment: any = {
    name: cleanString(params.consignee.name),
    add: cleanString(`${params.consignee.address1}${params.consignee.address2 ? ', ' + params.consignee.address2 : ''}`),
    city: cleanString(params.consignee.city),
    state: cleanString(params.consignee.state),
    pin: String(params.consignee.pincode || ''),
    country: params.consignee.country || 'India',
    phone: cleanPhone(params.consignee.phone || ''),
    email: params.consignee.email || '',
    order: cleanString(params.orderNumber),
    payment_mode: params.paymentMode === 'Prepaid' ? 'Pre-paid' : params.paymentMode,
    weight: Number(params.weightKg || 0.5),
    quantity: Number(params.quantity || 1),
    total_amount: Number(params.invoiceValue || 0),
    cod_amount: params.paymentMode === 'COD' ? Number(params.codAmount || params.invoiceValue || 0) : 0,
  };

  const pickupLocation = params.pickup?.location || process.env.DELHIVERY_PICKUP_LOCATION || '';
  const clientCode = params.client || process.env.DELHIVERY_CLIENT || '';
  
  // Add pickup_location and client directly to the shipment object as per Delhivery spec
  if (pickupLocation) shipment.pickup_location = pickupLocation;
  if (clientCode) shipment.client = clientCode;

  // Try Attempt 1: Standard format with shipments wrapped in data field
  console.log('🚚 Delhivery Create Shipment - Attempt 1: Standard Format');
  console.log('URL:', url);
  console.log('Client Code:', clientCode);
  console.log('Pickup Location:', pickupLocation);
  
  let form = new URLSearchParams();
  form.set('format', 'json');
  form.set('data', JSON.stringify([shipment]));
  
  console.log('Payload (urlencoded form):', form.toString().substring(0, 300));
  
  let res = await fetch(url, { method: 'POST', headers: getHeaders(), body: form });
  let text = await res.text();
  let json: any = {};
  try { json = JSON.parse(text); } catch { json = {}; }
  
  console.log('📦 Response:', res.status, json.rmk || json.message || 'OK');
  
  const extractMsg = (fallback: string) => (json && (json.rmk || json.remarks || json.remark || json.message || json.error)) || fallback;
  const isSuccess = res.ok && json && json.success !== false && json.error !== true;
  
  // If failed with parsing error, try alternative formats
  if (!isSuccess && extractMsg('').toLowerCase().includes('object has no attribute')) {
    console.log('\n🔄 Attempt 2: Trying shipments object wrapper...');
    
    form = new URLSearchParams();
    form.set('format', 'json');
    form.set('data', JSON.stringify({ shipments: [shipment] }));
    
    res = await fetch(url, { method: 'POST', headers: getHeaders(), body: form });
    text = await res.text();
    try { json = JSON.parse(text); } catch { json = {}; }
    console.log('📦 Response:', res.status, json.rmk || json.message || 'OK');
  }
  
  // Try direct JSON body if still failing
  if (!res.ok || (json && (json.success === false || json.error === true))) {
    if (extractMsg('').toLowerCase().includes('object has no attribute')) {
      console.log('\n🔄 Attempt 3: Trying direct JSON POST...');
      
      const directPayload = { format: 'json', data: [shipment] };
      const jsonHeaders = { ...getHeaders(), 'Content-Type': 'application/json' };
      
      res = await fetch(url, { 
        method: 'POST', 
        headers: jsonHeaders, 
        body: JSON.stringify(directPayload) 
      });
      text = await res.text();
      try { json = JSON.parse(text); } catch { json = {}; }
      console.log('📦 Response:', res.status, json.rmk || json.message || 'OK');
    }
  }
  
  // Final error check
  if (!res.ok) {
    const msg = extractMsg(text || 'Delhivery create shipment failed');
    throw new Error(msg);
  }
  if (json && (json.success === false || json.error === true)) {
    const msg = extractMsg('Delhivery create shipment returned error');
    throw new Error(msg);
  }
  
  console.log('✅ Shipment created successfully');
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
    if (!s) return '11:00-15:00';
    // Accept HHMM-HHMM and convert to HH:MM-HH:MM
    if (/^\d{4}-\d{4}$/.test(s)) {
      const [a, b] = s.split('-');
      return `${a.slice(0, 2)}:${a.slice(2)}-${b.slice(0, 2)}:${b.slice(2)}`;
    }
    // If already HH:MM-HH:MM keep as is
    if (/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(s)) return s;
    return s;
  })();
  form.set('pickup_time', slot);
  form.set('pickup_location', args.pickup?.location || process.env.DELHIVERY_PICKUP_LOCATION || '');
  form.set('expected_package_count', String(Number(args.expectedPackageCount || 1)));
  if (process.env.DELHIVERY_PICKUP_REMARKS) form.set('remarks', process.env.DELHIVERY_PICKUP_REMARKS);

  const res = await fetch(url, { method: 'POST', headers: getHeaders(), body: form as any });
  const text = await res.text();
  let json: any = {};
  try { json = JSON.parse(text); } catch { json = {}; }
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
  const base = getBaseUrl();
  
  // Try multiple label endpoints
  const endpoints = [
    `${base}/api/p/packing_slip?wbns=${encodeURIComponent(waybills.join(','))}&pdf=true`,
    `${base}/api/p/packing_slip_pdf?wbns=${encodeURIComponent(waybills.join(','))}`,
    `${base}/api/p/packing_slip?wbns=${encodeURIComponent(waybills.join(','))}`,
  ];
  
  console.log('📄 Delhivery Label Request for waybills:', waybills);
  
  for (let i = 0; i < endpoints.length; i++) {
    const url = endpoints[i];
    console.log(`\n🔄 Attempt ${i + 1}: ${url.substring(base.length)}`);
    
    try {
      const res = await fetch(url, { headers: getHeaders() });
      const contentType = res.headers.get('content-type') || '';
      
      console.log('Response:', res.status, contentType);
      
      // Skip if 404 or other error status
      if (!res.ok) {
        console.log(`❌ HTTP ${res.status} - skipping`);
        continue;
      }
      
      // If we got a PDF, return it
      if (contentType.includes('pdf')) {
        const buf = await res.arrayBuffer();
        // Validate it's actually a PDF (PDF files start with %PDF)
        const header = Buffer.from(buf.slice(0, 5)).toString('ascii');
        if (header === '%PDF-') {
          const base64 = Buffer.from(buf).toString('base64');
          console.log('✅ Valid PDF label generated, size:', buf.byteLength, 'bytes');
          return { pdfBase64: base64 };
        } else {
          console.log('❌ Invalid PDF content - skipping');
          continue;
        }
      }
      
      // If JSON response, check for embedded data
      if (contentType.includes('json')) {
        const json = await res.json();
        console.log('JSON response received');
        
        // Check if there's a PDF URL in the response
        if (json.pdf_url || json.pdfUrl) {
          const pdfUrl = json.pdf_url || json.pdfUrl;
          console.log('Found PDF URL in response:', pdfUrl);
          const pdfRes = await fetch(pdfUrl, { headers: getHeaders() });
          if (pdfRes.ok) {
            const buf = await pdfRes.arrayBuffer();
            const header = Buffer.from(buf.slice(0, 5)).toString('ascii');
            if (header === '%PDF-') {
              const base64 = Buffer.from(buf).toString('base64');
              return { pdfBase64: base64 };
            }
          }
        }
        
        // Continue to next endpoint
        continue;
      }
      
      // Try as buffer if we got 200 OK with unknown content type
      if (res.ok) {
        const buf = await res.arrayBuffer();
        // Check if it's actually a PDF
        const header = Buffer.from(buf.slice(0, 5)).toString('ascii');
        if (header === '%PDF-') {
          const base64 = Buffer.from(buf).toString('base64');
          console.log('✅ Valid PDF found (unknown content-type), size:', buf.byteLength, 'bytes');
          return { pdfBase64: base64 };
        }
      }
    } catch (err: any) {
      console.log(`❌ Attempt ${i + 1} failed:`, err.message);
      continue;
    }
  }
  
  // All attempts failed - throw error
  throw new Error('Unable to generate PDF label via API. Please use "View in Delhivery Dashboard" to download the label directly from Delhivery.');
}

export async function delhiveryInvoiceCharges(params: {
  originPincode: string;
  destPincode: string;
  weightGrams: number;
  paymentMode: 'Pre-paid' | 'COD';
  service?: string; // EXPRESS | SURFACE (optional)
  client?: string;
}) {
  const base = getBaseUrl();
  const url = new URL(`${base}/api/kinko/v1/invoice/charges/.json`);
  const cl = params.client || process.env.DELHIVERY_CLIENT || '';
  if (cl) url.searchParams.set('cl', cl);
  // Ensure required 'ss' (shipment status) is always present: Delivered | RTO | DTO
  const raw = (params as any).shipmentStatus || params.service;
  const allowed = new Set(['Delivered', 'RTO', 'DTO']);
  const ss = allowed.has(String(raw)) ? String(raw) : 'Delivered';
  url.searchParams.set('ss', ss);
  // md: mode - required by API: S (Surface) | E (Express)
  const service = String(params.service || '').trim().toUpperCase();
  const md = service === 'SURFACE' || service === 'S' ? 'S' : 'E';
  url.searchParams.set('md', md);
  url.searchParams.set('pt', params.paymentMode);
  url.searchParams.set('o_pin', params.originPincode);
  url.searchParams.set('d_pin', params.destPincode);
  url.searchParams.set('cgm', String(Math.max(1, Math.round(params.weightGrams || 1))));
  const res = await fetch(url.toString(), { headers: getHeaders() });
  const text = await res.text();
  let json: any = {};
  try { json = JSON.parse(text); } catch { json = {}; }
  if (!res.ok) {
    const msg = (json && (json.message || json.error || json.rmk || json.remarks)) || text || 'Delhivery invoice charges failed';
    throw new Error(msg);
  }
  return json && Object.keys(json).length ? json : text;
}
