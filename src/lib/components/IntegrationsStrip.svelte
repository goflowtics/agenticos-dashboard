<script lang="ts">
	import type { Integration } from '$lib/server/vault.js';

	let { integrations }: { integrations: Integration[] } = $props();
</script>

<div class="card py-3">
	<div class="flex items-center gap-6">
		<div class="label flex-shrink-0">Integrations</div>
		<div class="flex flex-wrap items-center gap-2">
			{#each integrations as intg}
				<div
					class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium"
					style="
						background: {intg.active ? 'var(--accent-light)' : 'var(--bg-deep)'};
						color: {intg.active ? 'var(--accent-dim)' : 'var(--text-dim)'};
						box-shadow: 0 0 0 1px {intg.active ? 'rgba(13,148,136,0.2)' : 'transparent'};
					"
				>
					<span
						class="w-1.5 h-1.5 rounded-full flex-shrink-0"
						style="background: {intg.active ? 'var(--green)' : 'var(--text-dim)'};"
					></span>
					{intg.label}
				</div>
			{/each}
		</div>
	</div>
</div>
