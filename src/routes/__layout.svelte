<script lang="ts">
	import '$lib/global.scss';
	import LoadingIndicator from '$lib/LoadingIndicator.svelte';
	import { navigating, session } from '$app/stores';
</script>

{#if $navigating} <LoadingIndicator /> {/if}

<nav>
	<a class="home-link" href="/">
		<h1 class="title">TicTacToeZone™</h1>
	</a>

	<a href="/new" class="nav-link">New game</a>
	<a href="/about" class="nav-link">About</a>
	<a href="/upgrade" class="nav-link">Upgrade</a>
	<a href="/blog" class="nav-link">Blog</a>
	{#if $session.authenticated}
		<a href="/logout" class="nav-link">Logout</a>
	{:else}
		<a href="/login" class="nav-link">Login</a>
	{/if}
</nav>

<main>
	<slot />
</main>

<style lang="scss">
	nav {
		display: flex;
		align-items: center;
		background-color: orange;
		color: white;
		padding: 0 10px;
		@media (max-width: 600px) {
			display: block;
		}
	}

	.home-link {
		padding: 5px;
		margin-right: auto;
		text-decoration: none;
	}

	.title {
		text-decoration: none;
		color: white;
	}

	.nav-link {
		text-decoration: none;
		padding: 10px;
		margin: 0 10px;
		color: white;
		&:hover {
			background-color: orangered;
		}
	}
</style>
