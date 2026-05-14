<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import SkillsGrid from '$lib/components/SkillsGrid.svelte';
	import RunPanel from '$lib/components/RunPanel.svelte';
	import RecentRuns from '$lib/components/RecentRuns.svelte';

	let { data }: { data: PageData } = $props();

	let activeRunId = $state<string | null>(null);
	let activeSkill = $state<string | null>(null);

	async function handleRun(detail: { skill: string; domain: string; input?: string }) {
		const { skill, domain, input } = detail;
		activeSkill = skill;
		activeRunId = null; // reset first so $effect re-fires even if same skill runs twice

		const res = await fetch('/api/run', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ skill, domain, input })
		});
		const { runId } = await res.json();
		activeRunId = runId;
	}

	const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
</script>

<div class="min-h-screen" style="background: var(--bg);">

	<header style="background: var(--bg-card); box-shadow: 0 0 0 1px var(--ring-soft);">
		<div class="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<span class="text-base font-bold tracking-widest uppercase">
					AGENTIC <span style="color: var(--accent);">OS</span>
				</span>
				<span class="label">/ {data.tenant.tenant_name}</span>
			</div>
			<div class="flex items-center gap-4">
				<span class="pulse-dot"></span>
				<span class="label tracking-wider">SYSTEM · LIVE</span>
				<span class="label">|</span>
				<span class="label">{data.tenant.plan.toUpperCase()}</span>
				<span class="label">|</span>
				<span class="label">{timestamp}</span>
			</div>
		</div>
	</header>

	<main class="max-w-[1600px] mx-auto px-6 py-6 space-y-6">

		<div class="card flex items-center gap-6 py-2">
			<div>
				<div class="label">Tenant</div>
				<div class="text-sm font-medium">{data.tenant.tenant_id}</div>
			</div>
			<div>
				<div class="label">Catalog</div>
				<div class="text-sm font-medium">{data.tenant.catalog.subscribed}</div>
			</div>
			<div>
				<div class="label">Region</div>
				<div class="text-sm font-medium">{data.tenant.region.toUpperCase()}</div>
			</div>
			<div>
				<div class="label">Users</div>
				<div class="text-sm font-medium">{data.tenant.users.map(u => u.email).join(', ')}</div>
			</div>
			<div class="ml-auto">
				<div class="label">Domains</div>
				<div class="text-sm font-medium">{data.domains.length} / 9</div>
			</div>
		</div>

		<SkillsGrid domains={data.domains} onrun={handleRun} />

		<div class="grid grid-cols-2 gap-4">
			<RunPanel runId={activeRunId} skill={activeSkill} ondone={() => invalidateAll()} />
			<RecentRuns runs={data.recentRuns} />
		</div>

	</main>
</div>
