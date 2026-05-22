<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();

	function focusInput(e: FocusEvent) {
		(e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 1.5px var(--accent)';
	}
	function blurInput(e: FocusEvent) {
		(e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 1px var(--ring-soft)';
	}
	function hoverBtn(e: MouseEvent) {
		(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-dim)';
	}
	function unhoverBtn(e: MouseEvent) {
		(e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)';
	}
</script>

<svelte:head><title>GoFlowtics OS — Sign in</title></svelte:head>

<div style="
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--bg);
">
	<div style="
		width: 360px;
		padding: 2.5rem;
		background: var(--bg-card);
		box-shadow: 0 0 0 1px var(--ring-soft);
		border-radius: 3px;
	">
		<div style="margin-bottom: 0.25rem;">
			<span style="
				font-family: 'Space Grotesk', system-ui, sans-serif;
				font-size: 1.25rem;
				font-weight: 700;
				color: var(--accent);
				letter-spacing: -0.01em;
			">GoFlowtics OS</span>
		</div>
		<div class="label" style="margin-bottom: 2rem;">Sign in to your workspace</div>

		{#if form?.sent}
			<div style="
				background: var(--accent-light);
				box-shadow: 0 0 0 1px var(--ring-accent);
				border-radius: 3px;
				padding: 0.9rem 1rem;
				font-size: 0.8rem;
				color: var(--accent-dim);
				line-height: 1.5;
			">
				Magic link sent — check your inbox.<br/>
				<span style="color: var(--text-dim); font-size: 0.75rem;">Valid for 15 minutes.</span>
			</div>
		{:else}
			<form method="POST" style="display: flex; flex-direction: column; gap: 0.75rem;">
				<input
					type="email"
					name="email"
					placeholder="your@email.com"
					autocomplete="email"
					required
					style="
						background: var(--bg);
						border: none;
						box-shadow: 0 0 0 1px var(--ring-soft);
						border-radius: 3px;
						padding: 0.65rem 0.85rem;
						color: var(--text);
						font-family: 'Inter', system-ui, sans-serif;
						font-size: 0.85rem;
						outline: none;
						width: 100%;
					"
					onfocus={focusInput}
					onblur={blurInput}
				/>
				{#if form?.error}
					<p style="color: var(--red); font-size: 0.78rem; margin: 0;">{form.error}</p>
				{/if}
				<button
					type="submit"
					style="
						background: var(--accent);
						color: #fff;
						border: none;
						border-radius: 3px;
						padding: 0.65rem;
						font-family: 'Inter', system-ui, sans-serif;
						font-size: 0.78rem;
						font-weight: 600;
						letter-spacing: 0.06em;
						text-transform: uppercase;
						cursor: pointer;
						transition: background 0.1s;
					"
					onmouseover={hoverBtn}
					onmouseout={unhoverBtn}
				>Send magic link</button>
			</form>
		{/if}
	</div>
</div>
