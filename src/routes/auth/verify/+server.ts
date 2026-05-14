import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { consumeMagicToken, createSession } from '$lib/server/auth.js';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const token = url.searchParams.get('token') ?? '';
	const user = consumeMagicToken(token);

	if (!user) throw error(400, 'Link expired or invalid. Request a new one.');

	const sessionCookie = createSession(user);
	cookies.set('session', sessionCookie, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
	});

	throw redirect(302, '/');
};
