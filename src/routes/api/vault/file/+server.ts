import { json, error } from '@sveltejs/kit';
import { readFileSync, existsSync } from 'fs';
import { join, normalize, relative } from 'path';
import { VAULT_PATH } from '$lib/server/vault.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const filePath = url.searchParams.get('path');
	if (!filePath) error(400, 'path required');

	// prevent path traversal
	const abs = normalize(join(VAULT_PATH, filePath));
	if (!abs.startsWith(VAULT_PATH)) error(403, 'forbidden');
	if (!abs.endsWith('.md') && !abs.endsWith('.yaml') && !abs.endsWith('.yml') && !abs.endsWith('.json') && !abs.endsWith('.jsonl')) {
		error(400, 'unsupported file type');
	}
	if (!existsSync(abs)) error(404, 'not found');

	const content = readFileSync(abs, 'utf8');
	const relPath = relative(VAULT_PATH, abs);
	return json({ path: relPath, content });
};
