import type { Request } from 'express';

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
  } as Record<string, string>;
};

export interface CreateCFOrderParams {
  cfOrderId?: string; // optional explicit cashfree order id
  orderAmount: number; // rupees
  currency?: string; // default INR
  customer: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  returnUrl: string;
  notes?: Record<string, any>;
}

export async function createCashfreeOrder(params: CreateCFOrderParams) {
  const base = getCashfreeBaseUrl();
  const url = `${base}/pg/orders`;

  const body: any = {
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
    order_note: params.notes?.note || '',
  };
  if (params.cfOrderId) body.order_id = params.cfOrderId;

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.message || json?.error || 'Cashfree order creation failed';
    throw new Error(msg);
  }
  return json; // contains order_id and payment_session_id
}

export async function fetchCashfreeOrder(cfOrderId: string) {
  const base = getCashfreeBaseUrl();
  const url = `${base}/pg/orders/${encodeURIComponent(cfOrderId)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json?.message || json?.error || 'Cashfree fetch order failed';
    throw new Error(msg);
  }
  return json;
}

export function getReturnUrl(req: Request, ourOrderId: string) {
  const base = process.env.WEB_BASE_URL || 'http://localhost:3000';
  const backendBase = process.env.API_BASE_URL || `${req.protocol}://${req.get('host')}`;
  // Backend route will process and redirect to frontend order page
  return `${backendBase}/v1/api/payments/cashfree/return?our_order_id=${encodeURIComponent(
    ourOrderId,
  )}&cf_order_id={order_id}`; // Cashfree replaces {order_id} in return
}
