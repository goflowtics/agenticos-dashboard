<script lang="ts">
	import type { TreeNode } from '../../routes/api/vault/tree/+server.js';

	let tree = $state<TreeNode[]>([]);
	let selectedPath = $state<string | null>(null);
	let fileContent = $state<string | null>(null);
	let fileLoading = $state(false);
	let treeLoading = $state(true);
	let expanded = $state<Set<string>>(new Set(['Daily', 'Contexts', 'Projects']));

	$effect(() => {
		fetch('/api/vault/tree')
			.then(r => r.json())
			.then(d => { tree = d.tree; treeLoading = false; })
			.catch(() => { treeLoading = false; });
	});

	async function openFile(path: string) {
		if (selectedPath === path) return;
		selectedPath = path;
		fileContent = null;
		fileLoading = true;
		try {
			const res = await fetch(`/api/vault/file?path=${encodeURIComponent(path)}`);
			const d = await res.json();
			fileContent = d.content ?? null;
		} catch {
			fileContent = null;
		}
		fileLoading = false;
	}

	function toggleDir(path: string) {
		const next = new Set(expanded);
		if (next.has(path)) next.delete(path);
		else next.add(path);
		expanded = next;
	}

	function renderTree(nodes: TreeNode[], depth = 0): string {
		return ''; // unused — using recursive component pattern in template
	}
</script>

<div class="grid gap-3" style="grid-template-columns: 260px 1fr; min-height: 520px;">

	<!-- File tree -->
	<div class="card" style="padding: 0.75rem; overflow-y: auto; max-height: 72vh;">
		<div class="label" style="margin-bottom: 0.75rem; padding: 0 0.25rem;">Vault</div>
		{#if treeLoading}
			<div style="color: var(--text-muted); font-size: 11px; padding: 0.5rem;">Loading…</div>
		{:else}
			{#snippet nodeList(nodes: TreeNode[], depth: number)}
				{#each nodes as node}
					{#if node.type === 'dir'}
						<button
							onclick={() => toggleDir(node.path)}
							style="
								display: flex; align-items: center; gap: 4px;
								width: 100%; padding: 3px {4 + depth * 12}px;
								background: none; border: none; cursor: pointer; text-align: left;
								font-size: 11px; font-weight: 600; color: var(--text-muted);
								border-radius: 2px;
							"
						>
							<span style="font-size: 9px; opacity: 0.6; width: 10px;">
								{expanded.has(node.path) ? '▾' : '▸'}
							</span>
							{node.name}
						</button>
						{#if expanded.has(node.path) && node.children}
							{@render nodeList(node.children, depth + 1)}
						{/if}
					{:else if node.name.endsWith('.md')}
						<button
							onclick={() => openFile(node.path)}
							style="
								display: block; width: 100%;
								padding: 3px {14 + depth * 12}px;
								background: {selectedPath === node.path ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'none'};
								border: none; cursor: pointer; text-align: left;
								font-size: 11px;
								color: {selectedPath === node.path ? 'var(--accent)' : 'var(--text)'};
								border-radius: 2px;
								white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
							"
						>
							{node.name.replace(/\.md$/, '')}
						</button>
					{/if}
				{/each}
			{/snippet}
			{@render nodeList(tree, 0)}
		{/if}
	</div>

	<!-- File viewer -->
	<div class="card" style="overflow-y: auto; max-height: 72vh;">
		{#if !selectedPath}
			<div style="color: var(--text-muted); font-size: 12px; padding: 1rem 0;">
				Select a file from the tree.
			</div>
		{:else if fileLoading}
			<div style="color: var(--text-muted); font-size: 12px; padding: 1rem 0;">Loading…</div>
		{:else if fileContent !== null}
			<div style="
				font-family: 'Inter', system-ui, sans-serif;
				color: var(--text-dim); font-size: 10px; margin-bottom: 1rem;
				font-family: monospace;
			">{selectedPath}</div>
			<pre style="
				white-space: pre-wrap; word-break: break-word;
				font-family: 'Inter', system-ui, sans-serif;
				font-size: 12px; line-height: 1.75; color: var(--text); margin: 0;
			">{fileContent}</pre>
		{:else}
			<div style="color: var(--text-muted); font-size: 12px; padding: 1rem 0;">Could not load file.</div>
		{/if}
	</div>

</div>
