import type { RequestHandler } from './$types';
import { getActiveRun } from '$lib/server/runner.js';

export const GET: RequestHandler = ({ params }) => {
	const { runId } = params;

	const stream = new ReadableStream({
		start(controller) {
			let lastIndex = 0;

			const send = (data: string) => {
				controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
			};

			const poll = setInterval(() => {
				const run = getActiveRun(runId);
				if (!run) {
					send('[run not found]');
					controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
					clearInterval(poll);
					controller.close();
					return;
				}

				// send any new lines
				while (lastIndex < run.lines.length) {
					send(run.lines[lastIndex]);
					lastIndex++;
				}

				if (run.status === 'done' || run.status === 'error') {
					const msg = run.status === 'done' ? '[DONE]' : '[ERROR]';
					controller.enqueue(new TextEncoder().encode(`data: ${msg}\n\n`));
					clearInterval(poll);
					controller.close();
				}
			}, 200);
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
