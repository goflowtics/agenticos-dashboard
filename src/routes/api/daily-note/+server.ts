import { json } from '@sveltejs/kit';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { VAULT_PATH } from '$lib/server/vault.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ locals }) => {
	const email = locals.user as string;
	const username = email.split('@')[0];
	const today = new Date().toISOString().slice(0, 10);

	// prefer per-user path, fall back to flat Daily/<date>.md (pre-migration or godfinns-written notes)
	const perUserPath = join(VAULT_PATH, 'Daily', username, `${today}.md`);
	const flatPath = join(VAULT_PATH, 'Daily', `${today}.md`);

	if (existsSync(perUserPath)) {
		return json({ content: readFileSync(perUserPath, 'utf8'), date: today, username, path: `Daily/${username}/${today}.md` });
	}
	if (existsSync(flatPath)) {
		return json({ content: readFileSync(flatPath, 'utf8'), date: today, username, path: `Daily/${today}.md` });
	}
	return json({ content: null, date: today, username, path: `Daily/${username}/${today}.md` });
};
