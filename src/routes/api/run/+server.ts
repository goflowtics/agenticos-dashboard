import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { startRun } from '$lib/server/runner.js';
import { readDomains } from '$lib/server/vault.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	const body = await request.json();
	const { skill, domain, input } = body as { skill: string; domain: string; input?: string };
	const user = locals.user ?? 'unknown';

	if (!skill || !domain) error(400, 'skill and domain required');

	// find the skill prompt from the vault
	const domains = readDomains();
	const dom = domains.find(d => d.slug === domain);
	const sk = dom?.skills.find(s => s.slug === skill);

	// build prompt: use SKILL.md body if found, otherwise a generic stub
	let prompt = sk
		? `Run the "${sk.name}" skill for the AgenticOS vault. ${sk.description}`
		: `Run skill: ${skill} in domain: ${domain}.`;

	if (sk?.promptPath) {
		try {
			const { readFileSync } = await import('fs');
			const raw = readFileSync(sk.promptPath, 'utf8');
			// strip frontmatter, use body as prompt
			const body = raw.replace(/^---[\s\S]*?---\n/, '').trim();
			if (body) prompt = body;
		} catch { /* fall back to description */ }
	}

	const runId = startRun({
		skill,
		domain,
		prompt,
		user,
		input
	});

	return json({ runId });
};
