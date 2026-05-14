import { readTenant, readDomains, readRecentRuns } from '$lib/server/vault.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const tenant = readTenant();
	const domains = readDomains();
	const recentRuns = readRecentRuns(20);
	return { tenant, domains, recentRuns };
};
