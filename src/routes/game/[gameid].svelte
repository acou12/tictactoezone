<script context="module" lang="ts">
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';

	export async function load({ page, fetch }: LoadInput): Promise<LoadOutput> {
		let res = await fetch(`${backend}/game/${page.params.gameid}`);
		if (res.ok) {
			let data = await res.json();
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
				} else if (data.type === 'result') {
					gameResult = data.result;
				} else if (data.type === 'action') {
					if (data.action === 'resign') {
						gameResult = 'Your opponent resigned.';
					} else if (data.action === 'offer_draw') {
						drawOffered = true;
					} else if (data.action === 'accept_draw') {
						gameResult = 'Your opponent accepted a draw.';
					}
				}
			};
		},
		() => {
			ws.close();
		}
	);

	let drawOffered = false;

	onDestroy(() => {
		ws?.close();
	});

	async function move(row: number, column: number) {
		drawOffered = false;
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
		gameResult = 'You resigned.';
		status = 'ENDED';
	};

	const draw = () => {
		ws.send(
			JSON.stringify({
				type: 'action',
				action: 'offer_draw',
			})
		);
	};

	const acceptDraw = () => {
		ws.send(
			JSON.stringify({
				type: 'action',
				action: 'accept_draw',
			})
		);
		gameResult = 'You accepted the draw.';
	};

	const takeback = () => {};

	$: gameInteractable =
		role !== false && connectedToWebsocket && status !== 'ENDED';

	let gameResult = '';
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
	<InteractiveBoard interactive={gameInteractable} onclick={move} {board} />
	<div class="side moves">
		<div>
			{#each moves as move, i}
				{i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ' '}
				{convertToNotation(move)}
				{#if i % 2 === 1} <br /> {/if}
			{/each}
		</div>

		<div>
			{gameResult}
		</div>

		<div class="buttons">
			<div class="button-wrapper">
				<button
					class="button game-button"
					on:click={resign}
					disabled={!gameInteractable}>Resign</button
				>
			</div>
			{#if drawOffered}
				<div class="button-wrapper">
					<button
						class="button game-button"
						on:click={acceptDraw}
						disabled={!gameInteractable}>Accept</button
					>
				</div>
			{:else}
				<div class="button-wrapper">
					<button
						class="button game-button"
						on:click={draw}
						disabled={!gameInteractable}>Draw</button
					>
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
</style>
