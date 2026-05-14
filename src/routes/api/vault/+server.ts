import { json } from '@sveltejs/kit';
import { readTenant, readDomains } from '$lib/server/vault.js';

export function GET() {
	const tenant = readTenant();
	const domains = readDomains();
	return json({ tenant, domains });
}
