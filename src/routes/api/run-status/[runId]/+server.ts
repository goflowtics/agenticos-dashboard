import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getActiveRun } from '$lib/server/runner.js';

export const GET: RequestHandler = ({ params }) => {
	const run = getActiveRun(params.runId);
	if (!run) return json({ found: false });
	return json({
		found: true,
		status: run.status,
		lineCount: run.lines.length,
		lines: run.lines
	});
};
