<script lang="ts">
	import type { DayCount } from '$lib/server/vault.js';

	let { data }: { data: DayCount[] } = $props();

	const W = 900;
	const H = 80;
	const pad = { l: 8, r: 8, t: 10, b: 24 };

	const maxCount = $derived(Math.max(...data.map(d => d.count), 1));

	function x(i: number): number {
		return pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
	}

	function y(v: number): number {
		return pad.t + (1 - v / maxCount) * (H - pad.t - pad.b);
	}

	const polyline = $derived(
		data.map((d, i) => `${x(i)},${y(d.count)}`).join(' ')
	);

	const area = $derived(
		`M${x(0)},${H - pad.b} ` +
		data.map((d, i) => `L${x(i)},${y(d.count)}`).join(' ') +
		` L${x(data.length - 1)},${H - pad.b} Z`
	);

	function fmt(date: string): string {
		const d = new Date(date + 'T12:00:00Z');
		return d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1);
	}
</script>

<div class="card">
	<div class="label mb-3">7-Day Run Activity</div>
	<svg
		viewBox="0 0 {W} {H}"
		width="100%"
		height="{H}"
		preserveAspectRatio="none"
		style="display: block; overflow: visible;"
	>
		<defs>
			<linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0%" stop-color="var(--accent)" stop-opacity="0.18" />
				<stop offset="100%" stop-color="var(--accent)" stop-opacity="0.02" />
			</linearGradient>
		</defs>

		<!-- area fill -->
		<path d={area} fill="url(#area-grad)" />

		<!-- line -->
		<polyline
			points={polyline}
			fill="none"
			stroke="var(--accent)"
			stroke-width="1.5"
			stroke-linejoin="round"
			stroke-linecap="round"
		/>

		<!-- dots + day labels -->
		{#each data as d, i}
			<circle
				cx={x(i)}
				cy={y(d.count)}
				r="3"
				fill="var(--accent)"
				stroke="var(--bg-card)"
				stroke-width="1.5"
			/>
			<text
				x={x(i)}
				y={H - 6}
				text-anchor="middle"
				font-size="9"
				font-family="Inter, system-ui, sans-serif"
				fill="var(--text-dim)"
			>{fmt(d.date)}</text>
			{#if d.count > 0}
				<text
					x={x(i)}
					y={y(d.count) - 7}
					text-anchor="middle"
					font-size="9"
					font-family="Inter, system-ui, sans-serif"
					fill="var(--accent)"
					font-weight="600"
				>{d.count}</text>
			{/if}
		{/each}
	</svg>
</div>
