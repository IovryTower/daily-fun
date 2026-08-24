// Shared helpers for Daily Fun admin API (Cloudflare Pages Functions)

const enc = new TextEncoder();
const dec = new TextDecoder();

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function b64urlEncode(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Encode each path segment for use in GitHub API URLs (UTF-8 / CJK safe)
export function ghPath(path) {
  return path.split('/').map((seg) => encodeURIComponent(seg)).join('/');
}

// UTF-8 safe base64 (GitHub contents API expects base64 of UTF-8 bytes)
export function toBase64(str) {
  const bytes = enc.encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

// For binary base64 image data, verify + return bytes length
export function b64ByteLength(b64) {
  const len = String(b64).length;
  if (len === 0) return 0;
  const pad = b64.endsWith('=') ? (b64.endsWith('==') ? 2 : 1) : 0;
  return (len * 3) / 4 - pad;
}

function b64urlDecode(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmac(key, data) {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(data));
  return new Uint8Array(sig);
}

export function constantTimeEq(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Create a signed session token valid for TOKEN_TTL hours.
// Token format: <payload b64url>.<sig b64url>, payload is JSON {u, exp}.
export async function createToken(env) {
  const exp = Date.now() + 12 * 3600 * 1000;
  const payload = b64urlEncode(enc.encode(JSON.stringify({ u: 'admin', exp })));
  const sig = await hmac(env.ADMIN_SECRET, payload);
  return `${payload}.${b64urlEncode(sig)}`;
}

// Verify a provided token; throws Error if invalid/expired.
export async function verifyToken(token, env) {
  if (!token) throw new Error('缺少凭证');
  const parts = token.split('.');
  if (parts.length !== 2) throw new Error('凭证格式错误');
  const [payload, sigB64] = parts;
  const expected = await hmac(env.ADMIN_SECRET, payload);
  const sig = b64urlDecode(sigB64);
  let ok = sig.length === expected.length;
  if (ok) {
    for (let i = 0; i < expected.length; i++) {
      if (sig[i] !== expected[i]) ok = false;
    }
  }
  if (!ok) throw new Error('凭证无效');
  const data = JSON.parse(dec.decode(b64urlDecode(payload)));
  if (data.u !== 'admin') throw new Error('凭证无效');
  if (typeof data.exp !== 'number' || data.exp < Date.now()) throw new Error('凭证已过期');
  return data;
}

// Extract Bearer token from request; throws if absent.
export function bearerToken(req) {
  const h = req.headers.get('Authorization') || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) throw new Error('缺少凭证');
  return m[1];
}

// Authenticate a request; returns {} on success, Response on failure.
export async function auth(req, env) {
  try {
    const token = bearerToken(req);
    await verifyToken(token, env);
    return null;
  } catch (e) {
    return json({ error: e.message || '未授权' }, 401);
  }
}

// GitHub API wrapper (fetch). Returns parsed JSON.
export async function github(path, env, options = {}) {
  const url = path.startsWith('http') ? path : `https://api.github.com${path}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let parsed = null;
  try { parsed = text ? JSON.parse(text) : null; } catch { parsed = text; }
  if (!res.ok) {
    const ghMsg = parsed && typeof parsed === 'object' && parsed.message ? `: ${parsed.message}` : '';
    const ghDoc = parsed && typeof parsed === 'object' && parsed.documentation_url ? ` (${parsed.documentation_url})` : '';
    const tok = env && env.GITHUB_TOKEN ? `tok=****${String(env.GITHUB_TOKEN).slice(-4)}` : 'tok=none';
    const rl = res.headers.get('x-ratelimit-remaining') ?? res.headers.get('ratelimit-remaining') ?? '';
    throw new Error(`GitHub ${res.status}${ghMsg}${ghDoc} @ ${path} | ${tok} rl=${rl}`);
  }
  return parsed;
}

// Parse frontmatter from markdown. Returns { data, body }.
// Handles scalar keys and `tags: [a, b]` arrays only (fixed schema).
export function parseFrontmatter(md) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(md);
  if (!m) return { data: {}, body: md };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let raw = line.slice(idx + 1).trim();
    if (/^\[.*\]$/.test(raw)) {
      raw = raw.slice(1, -1);
      data[key] = raw.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      raw = raw.replace(/^["']|["']$/g, '');
      data[key] = raw;
    }
  }
  return { data, body: m[2] ?? '' };
}

// Build frontmatter text from a whitelisted data object.
export function buildFrontmatter(data) {
  const lines = ['---'];
  const order = ['title', 'date', 'category', 'tags', 'image', 'imageAlt', 'description', 'source'];
  for (const key of order) {
    const v = data[key];
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      lines.push(`${key}: [${v.map((x) => x.trim()).filter(Boolean).join(', ')}]`);
    } else {
      lines.push(`${key}: ${String(v)}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}