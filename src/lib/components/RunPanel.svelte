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

					if (!data.found) {
						status = 'error';
						break;
					}

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
		<div class="label">ACTIVE RUN</div>
		{#if status === 'running'}
			<div class="flex items-center gap-2">
				<span class="pulse-dot"></span>
				<span class="label text-[9px]">{skill ?? '…'}</span>
			</div>
		{:else if status === 'done'}
			<span class="badge badge-catalog">DONE</span>
		{:else if status === 'error'}
			<span class="badge" style="background: #3a1a1a; color: var(--red);">ERROR</span>
		{/if}
	</div>

	<div
		bind:this={outputEl}
		class="rounded-sm p-3 text-[11px] leading-relaxed overflow-y-auto whitespace-pre-wrap"
		style="background: var(--bg); box-shadow: 0 0 0 1px var(--ring-soft); min-height: 240px; max-height: 400px; color: var(--text-muted); font-family: inherit;"
	>
		{#if status === 'idle'}
			<span style="color: var(--text-dim);">No active run. Click a skill button to start.</span>
		{:else if status === 'running' && lines.length === 0}
			<span style="color: var(--text-dim);">Running <span class="opacity-60">▋</span></span>
		{:else}
			{#each lines as line}
				{line}
			{/each}
			{#if status === 'running'}
				<span class="opacity-60">▋</span>
			{/if}
		{/if}
	</div>
</div>
