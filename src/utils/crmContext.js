// Structured facts for the CRM, sent alongside the email fields in the SAME
// post to the mail service. The mail service emails the shop exactly as before
// and hands a copy of the submission to the Pipedrive integration, which reads
// this block. Nothing here changes what the customer or the shop sees, and the
// mail service ignores the block when no CRM is connected.
//
// Raw values, not escaped: this never lands in an email.

// One id per press of the submit button. The automatic retries and every step
// of the send ladder reuse it, so one submission that gets posted twice is one
// deal. A customer who submits again on purpose gets a new id.
export const makeLeadId = (prefix) => {
  let hex = '';
  try {
    hex = crypto.randomUUID().replace(/-/g, '');
  } catch {
    hex = `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
  }
  return `${prefix}_${hex.slice(0, 24)}`;
};

const cleanPath = (value) => {
  const s = String(value || '').split(/[?#]/)[0].replace(/[^\w\-./]/g, '').slice(0, 200);
  return s.startsWith('/') ? s : '';
};

// The store page that embeds this app tells us which page it is (?src=) and,
// after load, which city page the visitor came through (postMessage mg:ctx).
// Both are best effort: a missing value sends an empty string, never a guess.
export function createCrmContext(prefix) {
  const params = new URLSearchParams(window.location.search);
  const ctx = {
    lead_id: makeLeadId(prefix),
    page: cleanPath(params.get('src')),
    city_page: cleanPath(params.get('city')),
  };

  const onMessage = (e) => {
    const d = e.data;
    if (!d || d.type !== 'mg:ctx') return;
    let host = '';
    try { host = new URL(e.origin).hostname; } catch { return; }
    if (!/(^|\.)myshopify\.com$|(^|\.)meltdowngraphics\.com$/.test(host)) return;
    if (!ctx.page && cleanPath(d.page)) ctx.page = cleanPath(d.page);
    if (cleanPath(d.city_page)) ctx.city_page = cleanPath(d.city_page);
  };
  window.addEventListener('message', onMessage);
  try { window.parent.postMessage({ type: 'mg:ctx-request' }, '*'); } catch { /* not embedded */ }

  return ctx;
}

// The calculator mounts once, so one shared context listens from first paint.
let shared = null;
export const crmContext = () => {
  if (!shared) shared = createCrmContext('calc');
  return shared;
};
