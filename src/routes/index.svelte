<script>
	import { session } from '$app/stores';
</script>

<h1>The home of TicTacToers around the world</h1>
<p>Join tens of other players in the most widespread game in the world.</p>

{#if $session.authenticated}
	<p>You're currently logged in as <em>{$session.username}<em>!</em></em></p>
{:else}
	<p>
		You're not logged in right now. <a href="/login">Login</a> to start a game.
	</p>
{/if}
