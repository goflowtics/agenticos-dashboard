<script lang="ts">
	import type { RunRecord } from '$lib/server/vault.js';

	let { runs }: { runs: RunRecord[] } = $props();

	const events = $derived(
		runs
			.filter(r => r.action === 'skill.run.end' || r.action === 'skill.run.start')
			.slice(0, 12)
			.map(r => ({
				ts: r.ts,
				skill: r.skill,
				kind: r.action === 'skill.run.end' ? r.status ?? 'done' : 'started',
			}))
	);

	function relTime(ts: string): string {
		const diff = Date.now() - new Date(ts).getTime();
		const m = Math.floor(diff / 60000);
		if (m < 1) return 'just now';
		if (m < 60) return `${m}m ago`;
		const h = Math.floor(m / 60);
		if (h < 24) return `${h}h ago`;
		return `${Math.floor(h / 24)}d ago`;
	}
</script>

<div class="card space-y-2">
	<div class="label">Vault Pulse</div>

	{#if events.length === 0}
		<div class="text-[11px] py-2" style="color: var(--text-dim);">No activity yet.</div>
	{:else}
		<div class="space-y-1.5">
			{#each events as ev}
				<div class="flex items-start gap-2 py-1" style="border-bottom: 1px solid var(--ring-soft);">
					<span
						class="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
						style="background: {ev.kind === 'done' ? 'var(--green)' : ev.kind === 'error' ? 'var(--red)' : 'var(--accent)'};"
					></span>
					<div class="flex-1 min-w-0">
						<div class="text-[11px] font-medium truncate">{ev.skill}</div>
						<div class="text-[9px]" style="color: var(--text-dim);">{ev.kind} · {relTime(ev.ts)}</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
