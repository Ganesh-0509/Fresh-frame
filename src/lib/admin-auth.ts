/**
 * Minimal admin auth for the panel — a signed session cookie gated by a password
 * in the Worker env (ADMIN_PASSWORD). This is a pragmatic v1; the production
 * upgrade is Better Auth (multi-user, roles) — tracked in ARCHITECTURE.md.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const COOKIE = "sf_admin";

function env() {
	return getCloudflareContext().env as unknown as {
		ADMIN_PASSWORD?: string;
		ADMIN_SESSION_SECRET?: string;
	};
}

async function sign(value: string, secret: string): Promise<string> {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
	return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

/** The token we store in the cookie = HMAC of a fixed marker with the secret. */
async function expectedToken(): Promise<string> {
	const secret = env().ADMIN_SESSION_SECRET || "insecure-fallback-secret";
	return sign("admin-ok", secret);
}

export async function verifyPassword(password: string): Promise<boolean> {
	const expected = env().ADMIN_PASSWORD || "";
	return expected.length > 0 && password === expected;
}

export async function createSession(): Promise<void> {
	const token = await expectedToken();
	const store = await cookies();
	store.set(COOKIE, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: true,
		path: "/",
		maxAge: 60 * 60 * 12, // 12h
	});
}

export async function destroySession(): Promise<void> {
	const store = await cookies();
	store.delete(COOKIE);
}

export async function isAuthed(): Promise<boolean> {
	const store = await cookies();
	const token = store.get(COOKIE)?.value;
	if (!token) return false;
	return token === (await expectedToken());
}

/** Call at the top of every protected admin page/action. Redirects if not logged in. */
export async function requireAdmin(): Promise<void> {
	if (!(await isAuthed())) redirect("/admin/login");
}
