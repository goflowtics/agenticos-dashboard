<script lang="ts">
	let {
		skillsBuilt,
		totalSkills
	}: {
		skillsBuilt: number;
		totalSkills: number;
	} = $props();

	const skillPct = $derived(totalSkills > 0 ? Math.round((skillsBuilt / totalSkills) * 100) : 0);
</script>

<div class="grid grid-cols-3 gap-4">
	<!-- 5H Token Window (stub) -->
	<div class="card">
		<div class="label mb-2">5H Token Window</div>
		<div class="flex items-end gap-2 mb-3">
			<span class="font-display text-3xl font-700" style="color: var(--accent); line-height: 1;">—</span>
			<span class="text-xs pb-1" style="color: var(--text-dim);">/ 200K</span>
		</div>
		<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--bg-deep);">
			<div class="h-full rounded-full" style="background: var(--accent); width: 0%;"></div>
		</div>
		<div class="mt-1.5 text-[10px]" style="color: var(--text-dim);">Token usage not wired</div>
	</div>

	<!-- Weekly Token Window (stub) -->
	<div class="card">
		<div class="label mb-2">Weekly Token Window</div>
		<div class="flex items-end gap-2 mb-3">
			<span class="font-display text-3xl font-700" style="color: var(--accent); line-height: 1;">—</span>
			<span class="text-xs pb-1" style="color: var(--text-dim);">/ 1M</span>
		</div>
		<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--bg-deep);">
			<div class="h-full rounded-full" style="background: var(--accent); width: 0%;"></div>
		</div>
		<div class="mt-1.5 text-[10px]" style="color: var(--text-dim);">Token usage not wired</div>
	</div>

	<!-- Skills Built -->
	<div class="card">
		<div class="label mb-2">Skills Built</div>
		<div class="flex items-end gap-2 mb-3">
			<span class="font-display text-3xl font-700" style="color: var(--accent); line-height: 1;">{skillsBuilt}</span>
			<span class="text-xs pb-1" style="color: var(--text-dim);">/ {totalSkills} defined</span>
		</div>
		<div class="h-1.5 rounded-full overflow-hidden" style="background: var(--bg-deep);">
			<div class="h-full rounded-full transition-all" style="background: var(--accent); width: {skillPct}%;"></div>
		</div>
		<div class="mt-1.5 text-[10px]" style="color: var(--text-dim);">{skillPct}% of skill library built</div>
	</div>
</div>
