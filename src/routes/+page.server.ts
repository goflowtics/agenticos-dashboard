import {
	readTenant,
	readDomains,
	readRecentRuns,
	readIntegrations,
	countBuiltSkills,
	readRunsPerDay
} from '$lib/server/vault.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	const tenant = readTenant();
	const domains = readDomains();
	const recentRuns = readRecentRuns(20);
	const integrations = readIntegrations();
	const skillsBuilt = countBuiltSkills();
	const runsPerDay = readRunsPerDay(7);
	return { tenant, domains, recentRuns, integrations, skillsBuilt, runsPerDay };
};
