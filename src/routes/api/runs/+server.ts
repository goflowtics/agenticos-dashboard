import { json } from '@sveltejs/kit';
import { readRecentRuns } from '$lib/server/vault.js';

export function GET() {
	const runs = readRecentRuns(30);
	return json({ runs });
}
