import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { homedir } from 'os';
import { parse as parseYaml } from 'yaml';

export const VAULT_PATH = resolve(
	(process.env.VAULT_PATH ?? '~/Work/goflowtics-vault').replace(/^~/, homedir())
);

export const CATALOG_PATH = resolve(
	(process.env.CATALOG_PATH ?? '~/Work/agenticos-catalog').replace(/^~/, homedir())
);

// Preload catalog skills indexed by domain slug, loaded once per process
let _catalogSkills: Map<string, Skill[]> | null = null;

function loadCatalogSkills(): Map<string, Skill[]> {
	if (_catalogSkills) return _catalogSkills;
	_catalogSkills = new Map();
	const skillsDir = join(CATALOG_PATH, 'skills');
	if (!existsSync(skillsDir)) return _catalogSkills;

	for (const slug of readdirSync(skillsDir)) {
		if (slug.startsWith('.')) continue;
		const skillMd = join(skillsDir, slug, 'SKILL.md');
		if (!existsSync(skillMd)) continue;
		const raw = readFileSync(skillMd, 'utf8');
		const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
		const fm = fmMatch ? (parseYaml(fmMatch[1]) as Record<string, unknown>) : {};
		const domain = (fm.domain as string) ?? 'ops-custom';
		if (!_catalogSkills.has(domain)) _catalogSkills.set(domain, []);
		_catalogSkills.get(domain)!.push({
			slug,
			name: (fm.name as string) ?? slug,
			description: (fm.description as string) ?? '',
			cadence: fm.cadence as string | undefined,
			badge: 'catalog',
			domain,
			promptPath: skillMd
		});
	}
	return _catalogSkills;
}

export interface Tenant {
	tenant_id: string;
	tenant_name: string;
	plan: string;
	catalog: { subscribed: string };
	users: Array<{ id: string; email: string; role: string }>;
	region: string;
}

export interface Skill {
	slug: string;
	name: string;
	description: string;
	cadence?: string;
	badge: 'catalog' | 'tenant' | 'project' | 'stub';
	domain: string;
	promptPath?: string;
}

export interface Domain {
	number: number;
	slug: string;
	name: string;
	description: string;
	skills: Skill[];
}

export interface RunRecord {
	ts: string;
	user: string;
	action: string;
	skill: string;
	status?: string;
	input_tokens?: number;
	output_tokens?: number;
	run_id?: string;
	prev_hash?: string;
}

export function readTenant(): Tenant {
	const p = join(VAULT_PATH, 'AgenticOS', 'tenant.yaml');
	if (!existsSync(p)) throw new Error(`tenant.yaml not found at ${p}`);
	return parseYaml(readFileSync(p, 'utf8')) as Tenant;
}

export function readDomains(): Domain[] {
	const domainsDir = join(VAULT_PATH, 'AgenticOS', 'domains');
	const files = readdirSync(domainsDir)
		.filter(f => /^\d{2}-/.test(f) && f.endsWith('.md'))
		.sort();

	return files.map(f => {
		const raw = readFileSync(join(domainsDir, f), 'utf8');
		const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
		const fm = fmMatch ? (parseYaml(fmMatch[1]) as Record<string, unknown>) : {};
		const nameMatch = raw.match(/^# (.+)$/m);
		const descMatch = raw.match(/^# .+\n+([^\n#]+)/m);

		const slug = (fm.slug as string) ?? f.replace(/^\d{2}-/, '').replace('.md', '');
		const number = (fm.number as number) ?? parseInt(f.slice(0, 2));
		const name = nameMatch?.[1] ?? slug;
		const description = descMatch?.[1]?.trim() ?? '';

		const tenantSkills = readSkillsForDomain(slug, number);
		const catalog = loadCatalogSkills();
		const catalogSkills = catalog.get(slug) ?? [];
		// merge: catalog first, then tenant stubs (dedup by slug)
		const skills = [
			...catalogSkills,
			...tenantSkills.filter(s => !catalogSkills.some(c => c.slug === s.slug))
		];

		return { number, slug, name, description, skills };
	});
}

function readSkillsForDomain(domainSlug: string, domainNumber: number): Skill[] {
	const prefix = String(domainNumber).padStart(2, '0');
	// try exact match first, then fallback to shortened slug (e.g. 09-ops for 09-ops-custom)
	const candidates = [
		join(VAULT_PATH, 'AgenticOS', '.claude', 'skills', `${prefix}-${domainSlug}`),
		join(VAULT_PATH, 'AgenticOS', '.claude', 'skills', `${prefix}-${domainSlug.split('-')[0]}`)
	];
	const tenantSkillsDir = candidates.find(existsSync);
	const skills: Skill[] = [];

	if (tenantSkillsDir) {
		for (const slug of readdirSync(tenantSkillsDir)) {
			if (slug.startsWith('.')) continue;
			const skillDir = join(tenantSkillsDir, slug);
			const skillMd = join(skillDir, 'SKILL.md');
			if (existsSync(skillMd)) {
				const raw = readFileSync(skillMd, 'utf8');
				const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
				const fm = fmMatch ? (parseYaml(fmMatch[1]) as Record<string, unknown>) : {};
				skills.push({
					slug,
					name: (fm.name as string) ?? slug,
					description: (fm.description as string) ?? '',
					cadence: fm.cadence as string | undefined,
					badge: 'tenant',
					domain: domainSlug,
					promptPath: skillMd
				});
			} else {
				// stub dir — show it so the user knows it exists but isn't built yet
				skills.push({
					slug,
					name: slug,
					description: 'Stub — not built yet.',
					badge: 'stub',
					domain: domainSlug
				});
			}
		}
	}

	return skills;
}

export function readRecentRuns(limit = 20): RunRecord[] {
	const runsDir = join(VAULT_PATH, 'AgenticOS', 'runs');
	if (!existsSync(runsDir)) return [];

	const files = readdirSync(runsDir)
		.filter(f => f.endsWith('.jsonl'))
		.sort()
		.reverse();

	const records: RunRecord[] = [];
	for (const f of files) {
		const lines = readFileSync(join(runsDir, f), 'utf8')
			.split('\n')
			.filter(Boolean)
			.reverse();
		for (const line of lines) {
			try { records.push(JSON.parse(line)); } catch { /* skip malformed */ }
			if (records.length >= limit) break;
		}
		if (records.length >= limit) break;
	}
	return records;
}
