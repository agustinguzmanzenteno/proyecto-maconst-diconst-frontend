
function normalizeBase(base) {
  if (!base) return '';
  let b = String(base).trim();

  if (!/^https?:\/\//i.test(b)) {
    if (/^:\d+$/.test(b)) {
      const { protocol, hostname } = window.location;
      b = `${protocol}//${hostname}${b}`;
    } else if (/^\d+$/.test(b)) {
      const { protocol, hostname } = window.location;
      b = `${protocol}//${hostname}:${b}`;
    } else if (b.startsWith('//')) {
      b = `${window.location.protocol}${b}`;
    } else {
      b = `http://${b}`;
    }
  }

  if (b.endsWith('/')) b = b.slice(0, -1);
  return b;
}

const API_BASE = normalizeBase(import.meta.env.VITE_API_URL || 'http://localhost:4000');

export async function apiMongoFetch(path, { method = 'GET', body, headers, noThrow = false } = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;

  const h = new Headers(headers || {});
  if (body && !(body instanceof FormData)) h.set('Content-Type', 'application/json');

  const res = await fetch(url, {
    method,
    headers: h,
    body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
    credentials: 'include',
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.mensaje || data.detalle)) || res.statusText || `HTTP ${res.status}`;
    if (noThrow) {
      console.warn('[apiMongo] noThrow activo → ignorando error', res.status, msg, { url });
      return data;
    }
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export const extractMongoId = (val) => {
  if (!val) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'object') {
    if (val.$oid) return String(val.$oid).trim();
    const maybe = Object.values(val)[0];
    if (typeof maybe === 'string') return maybe.trim();
  }
  return '';
};

export const toDateInput = (v) => {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d)) return '';
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
    .toISOString()
    .slice(0, 10);
};

if (import.meta.env.DEV) {
  console.log('[apiMongo] API_BASE =', API_BASE);
}