<script lang="ts">
	type Tile = 'x' | 'o' | '';

	const checkWin = (board: Tile[][]) => {
		const winStates: Tile[][][] = [
			[
				['o', '', ''],
				['o', '', ''],
				['o', '', ''],
			],
			[
				['', 'o', ''],
				['', 'o', ''],
				['', 'o', ''],
			],
			[
				['', '', 'o'],
				['', '', 'o'],
				['', '', 'o'],
			],
			[
				['o', 'o', 'o'],
				['', '', ''],
				['', '', ''],
			],
			[
				['', '', ''],
				['o', 'o', 'o'],
				['', '', ''],
			],
			[
				['', '', ''],
				['', '', ''],
				['o', 'o', 'o'],
			],
			[
				['o', '', ''],
				['', 'o', ''],
				['', '', 'o'],
			],
			[
				['', '', 'o'],
				['', 'o', ''],
				['o', '', ''],
			],
			[
				['x', '', ''],
				['x', '', ''],
				['x', '', ''],
			],
			[
				['', 'x', ''],
				['', 'x', ''],
				['', 'x', ''],
			],
			[
				['', '', 'x'],
				['', '', 'x'],
				['', '', 'x'],
			],
			[
				['x', 'x', 'x'],
				['', '', ''],
				['', '', ''],
			],
			[
				['', '', ''],
				['x', 'x', 'x'],
				['', '', ''],
			],
			[
				['', '', ''],
				['', '', ''],
				['x', 'x', 'x'],
			],
			[
				['x', '', ''],
				['', 'x', ''],
				['', '', 'x'],
			],
			[
				['', '', 'x'],
				['', 'x', ''],
				['x', '', ''],
			],
		];
		for (const state of winStates) {
			let allMatch = true;
			for (let y = 0; y < 3 && allMatch; y++) {
				for (let x = 0; x < 3 && allMatch; x++) {
					if (state[y][x] !== '' && board[y][x] !== state[y][x]) {
						allMatch = false;
					}
				}
			}
			if (allMatch) {
				return state;
			}
		}
		return [
			['', '', ''],
			['', '', ''],
			['', '', ''],
		];
	};

	const randomBoard = () => {
		const board: Tile[][] = [
			['', '', ''],
			['', '', ''],
			['', '', ''],
		];
		let current: Tile = 'x';
		let i = 0;
		while (
			checkWin(board)
				.flat()
				.every((it) => it === '') &&
			i < 100
		) {
			i++;
			const y = Math.floor(Math.random() * 3);
			const x = Math.floor(Math.random() * 3);
			if (board[y][x] === '') {
				board[y][x] = current;
				current = current === 'x' ? 'o' : 'x';
			}
		}
		return board;
	};

	export let board: Tile[][] = randomBoard();

	// export let board: Tile[][] = [
	// 	['', '', ''],
	// 	['', '', ''],
	// 	['', '', ''],
	// ];

	export let onclick: (row: number, column: number) => void = () => {};
	export let interactive: boolean = true;

	$: filled = checkWin(board);
</script>

<svg viewBox="-0.5 -0.5 4 4" xmlns="http://www.w3.org/2000/svg">
	<g class="lines">
		{#each board as row, rowNum}
			{#each row as tile, columnNum}
				{#if tile === 'o'}
					{#if filled[rowNum][columnNum]}
						<rect
							class="filledO"
							x={columnNum}
							y={rowNum}
							rx="0.01"
							width="1"
							height="1"
							stroke="none"
						/>
					{/if}
					<circle
						class="o"
						class:white={filled[rowNum][columnNum]}
						cx={columnNum + 0.5 + (columnNum - 1) * 0.05}
						cy={rowNum + 0.5 + (rowNum - 1) * 0.05}
						r="0.35"
						stroke-width="0.1"
					/>
				{:else if tile === 'x'}
					{#if filled[rowNum][columnNum]}
						<rect
							class="filledX"
							x={columnNum}
							y={rowNum}
							rx="0.01"
							width="1"
							height="1"
							stroke="none"
						/>
					{/if}
					<path
						class="x"
						class:white={filled[rowNum][columnNum]}
						d="M{columnNum + 0.25 + (columnNum - 1) * 0.05},{rowNum +
							0.25 +
							(rowNum - 1) * 0.05} L{columnNum +
							0.75 +
							(columnNum - 1) * 0.05},{rowNum +
							0.75 +
							(rowNum - 1) * 0.05} M{columnNum +
							0.75 +
							(columnNum - 1) * 0.05},{rowNum +
							0.25 +
							(rowNum - 1) * 0.05} L{columnNum +
							0.25 +
							(columnNum - 1) * 0.05},{rowNum + 0.75 + (rowNum - 1) * 0.05}"
						stroke-width="0.1"
					/>
				{:else if !filled[rowNum][columnNum]}
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

	.filledX {
		fill: #ff7f2a;
		stroke: #ff7f2a;
	}

	.filledO {
		fill: #4f9fe6;
		stroke: #4f9fe6;
	}

	.x {
		stroke: #ff7f2a;
	}

	.o {
		stroke: #4f9fe6;
	}

	.white {
		stroke: white !important;
	}
</style>
