import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSession } from '$lib/server/auth.js';

export const POST: RequestHandler = async ({ cookies }) => {
	const cookie = cookies.get('session');
	if (cookie) deleteSession(cookie);
	cookies.delete('session', { path: '/' });
	throw redirect(302, '/auth/login');
};
