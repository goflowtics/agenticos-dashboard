<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>AgenticOS — Sign in</title></svelte:head>

<div class="login-wrap">
	<div class="login-card">
		<div class="brand">AGENTIC<span class="accent">OS</span></div>
		<div class="label">SIGN IN</div>

		{#if form?.sent}
			<p class="sent">Check your inbox — link valid for 15 min.</p>
		{:else}
			<form method="POST">
				<input
					type="email"
					name="email"
					placeholder="your@email.com"
					autocomplete="email"
					required
				/>
				{#if form?.error}
					<p class="err">{form.error}</p>
				{/if}
				<button type="submit">SEND LINK</button>
			</form>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		background: #0e0f10;
		font-family: 'JetBrains Mono', 'Fira Mono', monospace;
		color: #e8e6e1;
	}
	.login-wrap {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.login-card {
		width: 340px;
		padding: 2rem;
		background: #1c1b19;
		box-shadow: 0 0 0 1px #2a2825;
		border-radius: 3px;
	}
	.brand {
		font-size: 1.1rem;
		letter-spacing: 0.12em;
		font-weight: 700;
		margin-bottom: 0.25rem;
	}
	.accent { color: #c96042; }
	.label {
		font-size: 0.65rem;
		letter-spacing: 0.18em;
		color: #6b6660;
		margin-bottom: 1.75rem;
	}
	form { display: flex; flex-direction: column; gap: 0.75rem; }
	input {
		background: #0e0f10;
		border: none;
		box-shadow: 0 0 0 1px #2a2825;
		border-radius: 2px;
		padding: 0.6rem 0.75rem;
		color: #e8e6e1;
		font-family: inherit;
		font-size: 0.8rem;
		outline: none;
	}
	input:focus { box-shadow: 0 0 0 1px #c96042; }
	button {
		background: #c96042;
		color: #0e0f10;
		border: none;
		border-radius: 2px;
		padding: 0.6rem;
		font-family: inherit;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		cursor: pointer;
	}
	button:hover { background: #d97052; }
	.err { color: #c96042; font-size: 0.75rem; margin: 0; }
	.sent { color: #8dba6e; font-size: 0.8rem; margin: 0; line-height: 1.5; }
</style>
