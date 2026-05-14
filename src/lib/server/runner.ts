import { spawn } from 'child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { VAULT_PATH } from './vault.js';

export interface RunOptions {
	skill: string;
	domain: string;
	prompt: string;
	user: string;
	input?: string;
}

export interface ActiveRun {
	id: string;
	skill: string;
	domain: string;
	startedAt: string;
	status: 'running' | 'done' | 'error';
	lines: string[];
}

const activeRuns = new Map<string, ActiveRun>();

export function getActiveRun(id: string): ActiveRun | undefined {
	return activeRuns.get(id);
}

export function startRun(opts: RunOptions): string {
	const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
	const ts = new Date().toISOString();

	const run: ActiveRun = {
		id: runId,
		skill: opts.skill,
		domain: opts.domain,
		startedAt: ts,
		status: 'running',
		lines: []
	};
	activeRuns.set(runId, run);

	appendRunLog({
		ts,
		run_id: runId,
		user: opts.user,
		action: 'skill.run.start',
		skill: opts.skill,
		domain: opts.domain
	});

	const prompt = opts.input
		? `${opts.prompt}\n\nUser input: ${opts.input}`
		: opts.prompt;

	const proc = spawn('claude', ['-p', prompt, '--output-format', 'text', '--dangerously-skip-permissions'], {
		cwd: VAULT_PATH,
		env: { ...process.env },
		stdio: ['ignore', 'pipe', 'pipe']
	});

	proc.stdout.on('data', (chunk: Buffer) => {
		run.lines.push(chunk.toString());
	});

	proc.stderr.on('data', (chunk: Buffer) => {
		run.lines.push(`[stderr] ${chunk.toString()}`);
	});

	proc.on('close', (code) => {
		run.status = code === 0 ? 'done' : 'error';
		appendRunLog({
			ts: new Date().toISOString(),
			run_id: runId,
			user: opts.user,
			action: 'skill.run.end',
			skill: opts.skill,
			status: run.status
		});
		appendAuditEntry({
			ts: new Date().toISOString(),
			run_id: runId,
			user: opts.user,
			action: 'skill.run',
			skill: opts.skill,
			domain: opts.domain,
			prompt_hash: `sha256:${createHash('sha256').update(prompt).digest('hex')}`,
			exit_code: code ?? -1
		});
		// clean up after 10 minutes
		setTimeout(() => activeRuns.delete(runId), 10 * 60 * 1000);
	});

	return runId;
}

function monthlyPath(folder: string): string {
	const now = new Date();
	const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
	const dir = join(VAULT_PATH, 'AgenticOS', folder);
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	return join(dir, `${ym}.jsonl`);
}

function lastHash(path: string): string {
	if (!existsSync(path)) return '0'.repeat(64);
	const lines = readFileSync(path, 'utf8').split('\n').filter(Boolean);
	if (!lines.length) return '0'.repeat(64);
	const last = lines[lines.length - 1];
	return createHash('sha256').update(last).digest('hex');
}

function appendRunLog(entry: Record<string, unknown>) {
	const path = monthlyPath('runs');
	appendFileSync(path, JSON.stringify(entry) + '\n');
}

function appendAuditEntry(entry: Record<string, unknown>) {
	const path = monthlyPath('audit');
	const prev_hash = lastHash(path);
	const full = { ...entry, prev_hash };
	appendFileSync(path, JSON.stringify(full) + '\n');
}
