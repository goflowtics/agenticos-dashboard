import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createMagicToken, sendMagicLink } from '$lib/server/auth.js';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = (data.get('email') as string | null)?.trim().toLowerCase() ?? '';

		if (!email || !email.includes('@')) {
			return fail(400, { error: 'Valid email required.' });
		}

		const token = createMagicToken(email);
		if (!token) {
			// don't leak whether the user exists — return same message
			return { sent: true };
		}

		const ok = await sendMagicLink(email, token);
		if (!ok) {
			return fail(500, { error: 'Failed to send email. Check RESEND_API_KEY.' });
		}

		return { sent: true };
	}
};
