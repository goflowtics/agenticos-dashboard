import { createHash, createHmac, randomBytes } from 'crypto';
import { readTenant } from './vault.js';

// --- config ---

const SESSION_SECRET = process.env.SESSION_SECRET ?? 'dev-secret-change-in-prod';
const TOKEN_TTL_MS = 15 * 60 * 1000;   // 15 min for magic links
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// --- in-memory stores (survive requests, reset on pm2 restart) ---

interface TokenEntry { user: string; expiresAt: number }
interface SessionEntry { user: string; expiresAt: number }

const pendingTokens = new Map<string, TokenEntry>();
const activeSessions = new Map<string, SessionEntry>();

// --- helpers ---

function rand(): string {
	return randomBytes(32).toString('hex');
}

function signSession(id: string): string {
	return createHmac('sha256', SESSION_SECRET).update(id).digest('hex');
}

function allowedUsers(): string[] {
	try {
		return readTenant().users.map(u => u.email.toLowerCase());
	} catch {
		return [];
	}
}

// --- magic link tokens ---

export function createMagicToken(email: string): string | null {
	const allowed = allowedUsers();
	if (!allowed.includes(email.toLowerCase())) return null;
	const token = rand();
	pendingTokens.set(token, { user: email.toLowerCase(), expiresAt: Date.now() + TOKEN_TTL_MS });
	return token;
}

export function consumeMagicToken(token: string): string | null {
	const entry = pendingTokens.get(token);
	if (!entry) return null;
	pendingTokens.delete(token);
	if (Date.now() > entry.expiresAt) return null;
	return entry.user;
}

// --- sessions ---

/** Returns `id.signature` cookie value */
export function createSession(user: string): string {
	const id = rand();
	activeSessions.set(id, { user, expiresAt: Date.now() + SESSION_TTL_MS });
	return `${id}.${signSession(id)}`;
}

/** Returns user email if valid, null otherwise */
export function validateSession(cookie: string): string | null {
	const dot = cookie.lastIndexOf('.');
	if (dot < 0) return null;
	const id = cookie.slice(0, dot);
	const sig = cookie.slice(dot + 1);
	if (sig !== signSession(id)) return null;
	const entry = activeSessions.get(id);
	if (!entry) return null;
	if (Date.now() > entry.expiresAt) { activeSessions.delete(id); return null; }
	return entry.user;
}

export function deleteSession(cookie: string): void {
	const dot = cookie.lastIndexOf('.');
	if (dot < 0) return;
	activeSessions.delete(cookie.slice(0, dot));
}

// --- Resend email sender ---

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
const FROM = process.env.AUTH_FROM ?? 'noreply@flexmedia.is';
const DASHBOARD_URL = process.env.DASHBOARD_URL ?? 'http://localhost:4242';

export async function sendMagicLink(email: string, token: string): Promise<boolean> {
	if (!RESEND_API_KEY) {
		// dev fallback: print link to stdout
		console.info(`[auth] magic link for ${email}: ${DASHBOARD_URL}/auth/verify?token=${token}`);
		return true;
	}
	const link = `${DASHBOARD_URL}/auth/verify?token=${token}`;
	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
		body: JSON.stringify({
			from: FROM,
			to: [email],
			subject: 'AgenticOS — sign in link',
			html: `<p>Click to sign in (valid 15 min):</p><p><a href="${link}">${link}</a></p>`
		})
	});
	return res.ok;
}

// --- fingerprint for audit log ---
export function sessionFingerprint(cookie: string): string {
	return createHash('sha256').update(cookie).digest('hex').slice(0, 16);
}
