<script lang="ts">
	let { children } = $props();
</script>

<svelte:head>
	<title>AgenticOS</title>
</svelte:head>

{@render children()}
