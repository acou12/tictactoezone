<script lang="ts">
	import { page } from '$app/stores';

	import { backend } from '$lib/config';
	import Loading from '$lib/Loading.svelte';

	let loggingIn = false;
	let error = '';

	$: after = $page.query.get('after');

	async function login() {
		loggingIn = true;
		let res = await fetch(`${backend}/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username,
				password,
			}),
		});
		if (res.ok) {
			let data = await res.json();
			document.cookie = `token=${data.token}; path=/`;
			window.location.href = after ?? '/';
		} else {
			loggingIn = false;
			error = 'Invalid username or password.';
		}
	}

	let username: string;
	let password: string;
</script>

<main>
	{#if loggingIn}
		<Loading size={200} />
	{:else}
		<h1>Login</h1>
		<form on:submit|preventDefault={login}>
			<input type="text" placeholder="Username" bind:value={username} />
			<input type="password" placeholder="Password" bind:value={password} />
			<input type="submit" value="Login" />
		</form>
		<p>
			Or <a href="/register{after !== null ? `?after=${after}` : ''}"
				>register</a
			>, if you haven't already.
		</p>
		<p>
			Or <a href="/ql{after !== null ? `?after=${after}` : ''}">QuickLogin©</a>.
		</p>
		<p class="error">{error}</p>
		{#if $page.query.get('after') !== null}
			<p>You'll redirect to {$page.query.get('after')} after logging in.</p>
		{/if}
	{/if}
</main>

<style lang="scss">
	@import 'forms';
</style>
