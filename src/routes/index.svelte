<script>
	import { session } from '$app/stores';
	import InteractiveBoard from '$lib/InteractiveBoard.svelte';
</script>

<main>
	<h1>The home of TicTacToers around the world</h1>
	<p>
		Here you can play the classic game of tic tac toe with other enthusiasts.
		Rank up on the leaderboard, improve your skill, and become the <span
			class="master-toer">MASTER TIC-TAC-TOER!</span
		>
	</p>
	<p>
		Start your TicTacToeZone™ journey by <a href="/tutorial"
			>starting the tutorial</a
		>
		or <a href="/sign-in">creating a game</a>, if you already know how to play.
	</p>
	<div class="quote">
		"The <span class="quote-highlight">divine game</span> of Tic Tac Toe is a
		<span class="quote-highlight">door into the soul</span>. TicTacToeZone™ is
		the
		<span class="quote-highlight">key</span>."
		<div class="cite"><cite> - Anonymous Tic Tac Toe grandmaster</cite></div>
	</div>

	{#if $session.authenticated}
		<p>You're currently logged in as <strong>{$session.username}</strong>!</p>
	{:else}
		<p>
			You're not logged in right now. <a href="/login">Login</a> to start a game.
		</p>
	{/if}

	<h2>Current Games</h2>
	<div class="flex">
		<InteractiveBoard interactive={false} />
		<InteractiveBoard interactive={false} />
		<InteractiveBoard interactive={false} />
	</div>
</main>

<style lang="scss">
	$orange: orange;

	.master-toer {
		color: $orange;
		text-decoration: dashed underline;
	}

	.quote {
		color: black;
		border-left: solid black 3px;
		padding: 10px;
		border-radius: 5px;
		margin-left: 30px;
	}

	.cite {
		margin-top: 5px;
		color: gray;
	}

	.quote-highlight {
		color: $orange;
	}

	p {
		margin: 10px 0;
	}

	.flex {
		display: flex;
	}
</style>
