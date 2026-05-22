<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import StatCards from '$lib/components/StatCards.svelte';
	import ActivityChart from '$lib/components/ActivityChart.svelte';
	import IntegrationsStrip from '$lib/components/IntegrationsStrip.svelte';
	import SkillBrowser from '$lib/components/SkillBrowser.svelte';
	import SkillRunner from '$lib/components/SkillRunner.svelte';
	import RunPanel from '$lib/components/RunPanel.svelte';
	import RecentRuns from '$lib/components/RecentRuns.svelte';
	import VaultPulse from '$lib/components/VaultPulse.svelte';

	let { data }: { data: PageData } = $props();

	let activeRunId = $state<string | null>(null);
	let activeSkill = $state<string | null>(null);
	let activeTab = $state<string>('Claude Code');

	const tabs = ['Claude Code', 'Vault', 'Daily Note', 'Runs', 'Drafts'];

	const totalSkills = $derived(data.domains.reduce((n, d) => n + d.skills.length, 0));

	const timestamp = new Date().toLocaleTimeString('en', {
		hour: '2-digit', minute: '2-digit', hour12: false
	});
	const dateStr = new Date().toLocaleDateString('en', {
		weekday: 'short', month: 'short', day: 'numeric'
	});

	async function handleRun(detail: { skill: string; domain: string; input?: string }) {
		const { skill, domain, input } = detail;
		activeSkill = skill;
		activeRunId = null;

		const res = await fetch('/api/run', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ skill, domain, input })
		});
		const { runId } = await res.json();
		activeRunId = runId;
	}

	function handleClear() {
		activeRunId = null;
		activeSkill = null;
	}
</script>

<svelte:head>
	<title>GoFlowtics OS</title>
</svelte:head>

<div style="background: var(--bg); min-height: 100vh;">

	<!-- Header -->
	<header style="background: var(--bg-card); box-shadow: 0 0 0 1px var(--ring-soft);">
		<div class="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<span
					class="font-display text-lg font-bold"
					style="color: var(--accent); font-family: 'Space Grotesk', system-ui, sans-serif; letter-spacing: -0.01em;"
				>GoFlowtics OS</span>
				<span style="color: var(--text-dim); font-size: 12px;">/</span>
				<span style="color: var(--text-muted); font-size: 12px;">{data.tenant.tenant_name}</span>
			</div>
			<div class="flex items-center gap-3">
				<span class="pulse-dot"></span>
				<span class="label">System · Live</span>
				<span class="label" style="color: var(--text-dim);">|</span>
				<span class="label">{dateStr} · {timestamp}</span>
			</div>
		</div>
	</header>

	<!-- Tab strip -->
	<div style="background: var(--bg-card); box-shadow: 0 0 0 1px var(--ring-soft); margin-top: 1px;">
		<div class="max-w-[1400px] mx-auto px-6 flex gap-0">
			{#each tabs as tab}
				<button
					style="
						border: none;
						background: transparent;
						cursor: pointer;
						padding: 0.6rem 1rem;
						border-bottom: 2px solid {activeTab === tab ? 'var(--accent)' : 'transparent'};
						color: {activeTab === tab ? 'var(--accent)' : 'var(--text-muted)'};
						font-family: 'Inter', system-ui, sans-serif;
						font-size: 11px;
						font-weight: 600;
						letter-spacing: 0.03em;
						transition: color 0.1s, border-color 0.1s;
					"
					onclick={() => (activeTab = tab)}
				>{tab}</button>
			{/each}
		</div>
	</div>

	<main class="max-w-[1400px] mx-auto px-6 py-6 space-y-4">

		<!-- Stat cards -->
		<StatCards skillsBuilt={data.skillsBuilt} {totalSkills} />

		<!-- Activity chart -->
		<ActivityChart data={data.runsPerDay} />

		<!-- Integrations strip -->
		<IntegrationsStrip integrations={data.integrations} />

		<!-- Two-column main area -->
		<div class="grid gap-4" style="grid-template-columns: 1fr 340px;">

			<!-- Left: Runner + Skill Browser + Run output -->
			<div class="space-y-4">
				<SkillRunner {activeSkill} onrun={handleRun} onclear={handleClear} />
				<SkillBrowser domains={data.domains} onrun={handleRun} />
				<RunPanel runId={activeRunId} skill={activeSkill} ondone={() => invalidateAll()} />
			</div>

			<!-- Right rail -->
			<div class="space-y-4">
				<RecentRuns runs={data.recentRuns} />
				<VaultPulse runs={data.recentRuns} />
				<div class="card space-y-2">
					<div class="label">Tenant</div>
					<div class="space-y-1.5">
						{#each [
							['Plan', data.tenant.plan],
							['Region', data.tenant.region.toUpperCase() + ' (EEA)'],
							['Catalog', data.tenant.catalog.subscribed],
						] as [k, v]}
							<div class="flex justify-between" style="font-size: 11px;">
								<span style="color: var(--text-muted);">{k}</span>
								<span style="font-weight: 500;">{v}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

	</main>
</div>
