<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>GoFlowtics OS</title>
</svelte:head>

{@render children()}
