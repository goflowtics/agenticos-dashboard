<script lang="ts">
	import type { Domain } from '$lib/server/vault.js';

	let {
		domains,
		onrun
	}: {
		domains: Domain[];
		onrun: (detail: { skill: string; domain: string }) => void;
	} = $props();
</script>

<div class="card space-y-1 p-3">
	<div class="label mb-3">Skill Browser</div>

	{#each domains as domain}
		<div class="flex items-start gap-3 py-2" style="border-bottom: 1px solid var(--ring-soft);">
			<!-- Domain label -->
			<div
				class="flex-shrink-0 pt-0.5"
				style="width: 100px;"
			>
				<span
					class="text-[10px] font-700 tracking-widest"
					style="color: var(--accent); font-family: 'Space Grotesk', system-ui, sans-serif;"
				>
					{domain.name.toUpperCase()}
				</span>
			</div>

			<!-- Skill pills -->
			<div class="flex flex-wrap gap-1.5">
				{#if domain.skills.length === 0}
					<span class="text-[10px]" style="color: var(--text-dim);">No skills built yet</span>
				{:else}
					{#each domain.skills as skill}
						{#if skill.badge !== 'stub'}
							<button
								class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all"
								style="
									background: var(--bg);
									box-shadow: 0 0 0 1px var(--ring-soft);
									color: var(--text);
									cursor: pointer;
									border: none;
								"
								title={skill.description}
								onmouseenter={(e) => {
									(e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px var(--ring-accent)';
									(e.currentTarget as HTMLElement).style.background = 'var(--accent-light)';
								}}
								onmouseleave={(e) => {
									(e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px var(--ring-soft)';
									(e.currentTarget as HTMLElement).style.background = 'var(--bg)';
								}}
								onclick={() => onrun({ skill: skill.slug, domain: domain.slug })}
							>
								{skill.slug}
								<span class="badge badge-{skill.badge}">{skill.badge}</span>
							</button>
						{:else}
							<span
								class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px]"
								style="color: var(--text-dim); background: var(--bg); box-shadow: 0 0 0 1px var(--ring-soft);"
								title="Stub — not built yet"
							>
								{skill.slug}
								<span class="badge badge-stub">stub</span>
							</span>
						{/if}
					{/each}
				{/if}
			</div>
		</div>
	{/each}
</div>
