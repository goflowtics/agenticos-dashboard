<script lang="ts">
	let {
		runId,
		skill,
		ondone
	}: {
		runId: string | null;
		skill: string | null;
		ondone: () => void;
	} = $props();

	let lines = $state<string[]>([]);
	let status = $state<'idle' | 'running' | 'done' | 'error'>('idle');
	let outputEl: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!runId) return;

		lines = [];
		status = 'running';

		let stopped = false;
		let lastCount = 0;

		async function poll() {
			while (!stopped) {
				try {
					const res = await fetch(`/api/run-status/${runId}`);
					const data = await res.json();

					if (!data.found) { status = 'error'; break; }

					if (data.lines.length > lastCount) {
						lines = data.lines;
						lastCount = data.lines.length;
						setTimeout(() => outputEl?.scrollTo(0, outputEl.scrollHeight), 10);
					}

					if (data.status === 'done') { status = 'done'; ondone(); break; }
					if (data.status === 'error') { status = 'error'; break; }
				} catch {
					status = 'error';
					break;
				}
				await new Promise(r => setTimeout(r, 500));
			}
		}

		poll();
		return () => { stopped = true; };
	});
</script>

<div class="card space-y-3">
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-2">
			{#if status === 'running'}
				<span class="pulse-dot"></span>
			{/if}
			<div class="label">
				{#if status === 'running'}
					Running — <span style="color: var(--accent);">{skill ?? '…'}</span>
				{:else if status === 'done'}
					Run Complete
				{:else if status === 'error'}
					Run Error
				{:else}
					Active Run
				{/if}
			</div>
		</div>
		{#if status === 'done'}
			<span class="badge badge-catalog">Done</span>
		{:else if status === 'error'}
			<span class="badge" style="background: #FEE2E2; color: var(--red);">Error</span>
		{/if}
	</div>

	<div
		bind:this={outputEl}
		class="rounded p-3 overflow-y-auto whitespace-pre-wrap font-mono"
		style="
			background: var(--bg);
			box-shadow: 0 0 0 1px var(--ring-soft);
			min-height: 200px;
			max-height: 420px;
			color: var(--text-muted);
			font-size: 11px;
			line-height: 1.6;
		"
	>
		{#if status === 'idle'}
			<span style="color: var(--text-dim);">Click a skill to run it, or type in the runner above.</span>
		{:else if status === 'running' && lines.length === 0}
			<span style="color: var(--text-dim);">Initialising <span style="opacity: 0.5;">▋</span></span>
		{:else}
			{#each lines as line}{line}{"\n"}{/each}{#if status === 'running'}<span style="opacity: 0.5;">▋</span>{/if}
		{/if}
	</div>
</div>
