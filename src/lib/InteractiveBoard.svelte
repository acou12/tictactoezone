<script lang="ts">
	type Tile = 'x' | 'o' | '';
	export let board: Tile[][] = [
		['o', 'x', ''],
		['', 'o', ''],
		['', 'x', 'o'],
	];
	export let onclick: (row: number, column: number) => void;
	export let interactive: boolean = true;
</script>

<svg viewBox="-0.5 -0.5 4 4" xmlns="http://www.w3.org/2000/svg">
	<g class="lines">
		{#each board as row, rowNum}
			{#each row as tile, columnNum}
				{#if tile === 'o'}
					<circle
						class="o"
						cx={columnNum + 0.5}
						cy={rowNum + 0.5}
						r="0.35"
						stroke-width="0.1"
					/>
				{:else if tile === 'x'}
					<path
						class="x"
						d="M{columnNum + 0.25},{rowNum + 0.25} L{columnNum + 0.75},{rowNum + 0.75} M{columnNum + 0.75},{rowNum +
							0.25} L{columnNum + 0.25},{rowNum + 0.75}"
						stroke-width="0.1"
					/>
				{:else}
					<rect
						class:select={interactive}
						x={columnNum}
						y={rowNum}
						rx="0.01"
						width="1"
						height="1"
						stroke="none"
						on:click={() => onclick(rowNum, columnNum)}
					/>
				{/if}
			{/each}
		{/each}
		<path d="M 1 0 l 0 3" />
		<path d="M 2 0 l 0 3" />
		<path d="M 0 1 l 3 0" />
		<path d="M 0 2 l 3 0" />
	</g>
</svg>

<style lang="scss">
	.lines {
		fill: none;
		stroke: black;
		stroke-width: 0.1;
		stroke-linecap: round;
	}

	.select {
		fill: transparent;
		stroke: transparent;
		&:hover {
			fill: #eeeeee;
			stroke: #eeeeee;
		}
	}

	.x {
		stroke: #ff7f2a;
	}

	.o {
		stroke: #4f9fe6;
	}
</style>
