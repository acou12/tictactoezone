<script context="module" lang="ts">
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';

	export async function load({ page, fetch }: LoadInput): Promise<LoadOutput> {
		let res = await fetch(`${backend}/game/${page.params.gameid}`);
		if (res.ok) {
			let data = await res.json();
			console.log(data);
			return {
				props: data,
			};
		}
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { backend, wsBackend } from '$lib/config';
	import InteractiveBoard from '$lib/InteractiveBoard.svelte';
	import { onDestroy } from 'svelte';
	import { onNavigate } from '$lib/custom-lifecycle';

	type GameStatus = 'WAITING' | 'ONGOING' | 'ENDED';

	export let board: ('x' | 'o' | '')[][];
	export let turn: 'x' | 'o';
	export let role: 'x' | 'o' | false;
	export let status: GameStatus;
	export let ticket: string;
	export let moves: [number, number][];

	if (!ticket) ticket = '';

	let connectedToWebsocket = false;

	let ws: WebSocket;
	onNavigate(
		() => {
			ws = new WebSocket(
				`${wsBackend}/game/${$page.params.gameid}?ticket=${ticket}`
			);
			ws.onopen = () => {
				connectedToWebsocket = true;
			};
			ws.onmessage = (e) => {
				let data = JSON.parse(e.data);
				if (data.type === 'error') {
					alert(data.error);
				} else if (data.type === 'move') {
					if (data.role !== role) {
						let [x, y] = data.move;
						moves = [...moves, [x, y]];
						board[x][y] = data.role;
						turn = data.role === 'x' ? 'o' : 'x';
					}
				} else if (data.type === 'status') {
					status = data.status;
				}
			};
		},
		() => {
			ws.close();
		}
	);

	onDestroy(() => {
		ws?.close();
	});

	async function move(row: number, column: number) {
		if (board[row][column] !== '') return;
		if (turn !== role) return;
		turn = turn === 'x' ? 'o' : 'x';
		board[row][column] = role;
		moves = [...moves, [row, column]];
		ws.send(
			JSON.stringify({
				type: 'move',
				move: [row, column],
			})
		);
	}

	const convertToNotation = ([row, column]: [number, number]) => {
		return `${['a', 'b', 'c'][column]}${3 - row}`;
	};

	const resign = () => {
		ws.send(
			JSON.stringify({
				type: 'action',
				action: 'resign',
			})
		);
		status = 'ENDED';
		alert('You resigned. What a loser.');
	};

	const draw = () => {};

	const takeback = () => {};
</script>

<main>
	{#if role === 'x' && status === 'WAITING'}<p>
			Send the following link to your opponent: <a
				href="/join/{$page.params.gameid}"
				>https://tttz.aydenmc.com/join/{$page.params.gameid}</a
			>
		</p>
	{/if}
</main>

<div class="flex">
	<InteractiveBoard
		interactive={role !== false && connectedToWebsocket && status !== 'ENDED'}
		onclick={move}
		{board}
	/>
	<div class="side moves">
		{#each moves as move, i}
			{i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ' '}
			{convertToNotation(move)}
			{#if i % 2 === 1} <br /> {/if}
		{/each}
		<div class="buttons">
			<button
				class="button game-button"
				on:click={resign}
				disabled={status === 'ENDED'}>Resign</button
			>
			<button
				class="button game-button"
				on:click={draw}
				disabled={status === 'ENDED'}>Draw</button
			>
			<button
				class="button game-button"
				on:click={takeback}
				disabled={status === 'ENDED'}>Takeback</button
			>
		</div>
	</div>
</div>

<style lang="scss">
</style>
