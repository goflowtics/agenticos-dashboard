<script lang="ts">
	import type { RunRecord } from '$lib/server/vault.js';

	let { runs }: { runs: RunRecord[] } = $props();

	const startEvents = $derived(runs.filter(r => r.action === 'skill.run.start'));
	const endEvents = $derived(new Map(
		runs
			.filter(r => r.action === 'skill.run.end')
			.map(r => [r.run_id, r])
	));

	const display = $derived(startEvents.slice(0, 10).map(r => ({
		skill: r.skill,
		ts: r.ts,
		status: endEvents.get(r.run_id)?.status ?? 'running'
	})));
</script>

<div class="card space-y-3">
	<div class="label">RECENT RUNS</div>

	{#if display.length === 0}
		<div class="text-[11px]" style="color: var(--text-dim);">No runs yet.</div>
	{:else}
		<div class="space-y-1">
			{#each display as run}
				<div class="flex items-center justify-between py-1" style="border-bottom: 1px solid var(--ring-soft);">
					<div>
						<div class="text-[11px] font-medium">{run.skill}</div>
						<div class="text-[9px]" style="color: var(--text-dim);">{run.ts.slice(0, 16).replace('T', ' ')}</div>
					</div>
					<span
						class="badge"
						style="background: {run.status === 'done' ? 'var(--catalog-badge)' : run.status === 'error' ? '#3a1a1a' : 'var(--tenant-badge)'}; color: {run.status === 'done' ? 'var(--green)' : run.status === 'error' ? 'var(--red)' : 'var(--text-muted)'};"
					>
						{run.status.toUpperCase()}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</div>
