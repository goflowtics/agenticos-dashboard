<script lang="ts">
	import type { Domain } from '$lib/server/vault.js';

	let {
		domains,
		onrun
	}: {
		domains: Domain[];
		onrun: (detail: { skill: string; domain: string; input?: string }) => void;
	} = $props();
</script>

<div class="card">
	<div class="label mb-4">SKILLS — {domains.reduce((n, d) => n + d.skills.length, 0)} skills across {domains.length} domains</div>

	<div class="grid gap-3" style="grid-template-columns: repeat(9, minmax(0, 1fr));">
		{#each domains as domain}
			<div>
				<div class="mb-2 pb-1" style="border-bottom: 1px solid var(--ring-soft);">
					<div class="label text-[9px] tracking-widest truncate" title={domain.name}>{domain.name.toUpperCase()}</div>
				</div>

				{#if domain.skills.length === 0}
					<div class="text-[10px]" style="color: var(--text-dim);">No skills yet.</div>
				{:else}
					<div class="space-y-2">
						{#each domain.skills as skill}
							<div class="rounded-sm p-2 space-y-1.5" style="background: var(--bg); box-shadow: 0 0 0 1px var(--ring-soft);">
								<div class="flex items-start justify-between gap-1">
									<span class="text-[10px] font-semibold leading-tight">{skill.slug}</span>
									<span class="badge badge-{skill.badge} flex-shrink-0">{skill.badge}</span>
								</div>
								{#if skill.description}
									<div class="text-[9px] leading-snug" style="color: var(--text-muted);">{skill.description}</div>
								{/if}
								{#if skill.cadence}
									<div class="text-[9px]" style="color: var(--text-dim);">{skill.cadence}</div>
								{/if}
								<button
									class="btn btn-accent w-full text-[9px] py-0.5"
									onclick={() => onrun({ skill: skill.slug, domain: domain.slug })}
								>
									RUN
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
