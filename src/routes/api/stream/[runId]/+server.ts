import type { RequestHandler } from './$types';
import { getActiveRun } from '$lib/server/runner.js';

export const GET: RequestHandler = ({ params }) => {
	const { runId } = params;
	let poll: ReturnType<typeof setInterval> | null = null;
	let closed = false;

	const stream = new ReadableStream({
		start(controller) {
			let lastIndex = 0;

			const send = (data: string) => {
				if (closed) return;
				try {
					controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
				} catch {
					closed = true;
					if (poll) clearInterval(poll);
				}
			};

			const close = () => {
				if (closed) return;
				closed = true;
				if (poll) clearInterval(poll);
				try { controller.close(); } catch { /* already closed */ }
			};

			poll = setInterval(() => {
				if (closed) {
					if (poll) clearInterval(poll);
					return;
				}

				const run = getActiveRun(runId);
				if (!run) {
					send('[run not found]');
					close();
					return;
				}

				while (lastIndex < run.lines.length) {
					send(run.lines[lastIndex]);
					lastIndex++;
				}

				if (run.status === 'done' || run.status === 'error') {
					send(run.status === 'done' ? '[DONE]' : '[ERROR]');
					close();
				}
			}, 200);
		},
		cancel() {
			closed = true;
			if (poll) clearInterval(poll);
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
