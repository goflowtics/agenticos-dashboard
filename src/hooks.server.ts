import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
	// auth routes are always public
	if (event.url.pathname.startsWith('/auth')) {
		return resolve(event);
	}

	// dev bypass: set SKIP_AUTH=true in .env.dev
	if (process.env.SKIP_AUTH === 'true') {
		event.locals.user = 'atli@goflowtics.com';
		return resolve(event);
	}

	const cookie = event.cookies.get('session');
	const user = cookie ? validateSession(cookie) : null;

	if (!user) {
		throw redirect(302, '/auth/login');
	}

	event.locals.user = user;
	return resolve(event);
};
