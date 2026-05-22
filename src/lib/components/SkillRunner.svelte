<script lang="ts">
	let {
		activeSkill,
		onrun,
		onclear
	}: {
		activeSkill: string | null;
		onrun: (detail: { skill: string; domain: string; input?: string }) => void;
		onclear: () => void;
	} = $props();

	let input = $state('');

	function handleRun() {
		const parts = input.trim().split(/\s+/);
		const skill = parts[0];
		if (!skill) return;
		onrun({ skill, domain: 'manual', input: parts.slice(1).join(' ') || undefined });
		input = '';
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleRun();
	}
</script>

<div class="card space-y-3">
	<div class="label">Skill Runner</div>

	<div class="flex flex-col gap-2">
		<textarea
			bind:value={input}
			onkeydown={handleKey}
			placeholder="skill-slug [optional input]  ·  Cmd+Enter to run"
			rows="3"
			class="w-full rounded p-3 text-sm font-mono resize-none"
			style="
				background: var(--bg);
				box-shadow: 0 0 0 1px var(--ring-soft);
				color: var(--text);
				border: none;
				outline: none;
				font-size: 12px;
				line-height: 1.5;
			"
			onfocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 1.5px var(--accent)')}
			onblur={(e) => (e.currentTarget.style.boxShadow = '0 0 0 1px var(--ring-soft)')}
		></textarea>

		<div class="flex items-center gap-2">
			<button class="btn btn-accent" onclick={handleRun} disabled={!input.trim()}>
				Run ▶
			</button>
			<button class="btn btn-ghost" onclick={onclear}>
				Clear
			</button>
			{#if activeSkill}
				<span class="text-[11px] ml-auto" style="color: var(--text-muted);">
					Last: <span style="color: var(--accent);">{activeSkill}</span>
				</span>
			{/if}
		</div>
	</div>
</div>
