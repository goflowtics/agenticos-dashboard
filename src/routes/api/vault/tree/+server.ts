import { json } from '@sveltejs/kit';
import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { VAULT_PATH } from '$lib/server/vault.js';

export interface TreeNode {
	name: string;
	path: string; // relative to vault root
	type: 'file' | 'dir';
	children?: TreeNode[];
}

const SKIP = new Set(['.git', '.obsidian', 'node_modules', '.DS_Store']);
// Only show these top-level folders (keeps the tree focused)
const TOP_LEVEL_ALLOW = new Set([
	'Daily', 'Contexts', 'Projects', 'Resources', 'wiki',
	'AI', 'AgenticOS', 'People', 'Ideas', 'Life'
]);

function buildTree(absPath: string, relPath: string, depth: number): TreeNode[] {
	if (depth > 4) return [];
	return readdirSync(absPath)
		.filter(name => {
			if (SKIP.has(name)) return false;
			if (depth === 0 && !TOP_LEVEL_ALLOW.has(name)) return false;
			return true;
		})
		.map(name => {
			const abs = join(absPath, name);
			const rel = relPath ? `${relPath}/${name}` : name;
			const stat = statSync(abs);
			if (stat.isDirectory()) {
				return { name, path: rel, type: 'dir' as const, children: buildTree(abs, rel, depth + 1) };
			}
			return { name, path: rel, type: 'file' as const };
		})
		.sort((a, b) => {
			if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
}

export function GET() {
	if (!existsSync(VAULT_PATH)) return json({ tree: [] });
	return json({ tree: buildTree(VAULT_PATH, '', 0) });
}
