<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';

	let { runId, skill }: { runId: string | null; skill: string | null } = $props();

	const dispatch = createEventDispatcher<{ done: void }>();

	let lines = $state<string[]>([]);
	let status = $state<'idle' | 'running' | 'done' | 'error'>('idle');
	let es: EventSource | null = null;
	let outputEl: HTMLDivElement;

	$effect(() => {
		if (!runId) return;

		lines = [];
		status = 'running';

		es?.close();
		es = new EventSource(`/api/stream/${runId}`);

		es.onmessage = (e) => {
			const text: string = JSON.parse(e.data);
			if (text === '[DONE]') {
				status = 'done';
				es?.close();
				dispatch('done');
			} else if (text === '[ERROR]') {
				status = 'error';
				es?.close();
				dispatch('done');
			} else {
				lines.push(text);
				// auto-scroll
				setTimeout(() => outputEl?.scrollTo(0, outputEl.scrollHeight), 10);
			}
		};

		es.onerror = () => {
			status = 'error';
			es?.close();
		};
	});

	onDestroy(() => es?.close());
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
