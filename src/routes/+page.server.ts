import {
	readTenant,
	readDomains,
	readRecentRuns,
	readIntegrations,
	countBuiltSkills,
	readRunsPerDay
} from '$lib/server/vault.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	const user = (locals.user as string) ?? 'atli@goflowtics.com';
	const tenant = readTenant();
	const domains = readDomains();
	const recentRuns = readRecentRuns(20);
	const integrations = readIntegrations();
	const skillsBuilt = countBuiltSkills();
	const runsPerDay = readRunsPerDay(7);
	return { tenant, domains, recentRuns, integrations, skillsBuilt, runsPerDay, user };
};
