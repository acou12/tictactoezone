<script lang="ts">
	import { backend } from '$lib/config';
	import Loading from '$lib/Loading.svelte';
	import { onMount } from 'svelte';
	import chance from 'chance';
	import { page } from '$app/stores';

	/**
	 * Generate a random alpha-numeric string of length `length`.
	 *
	 */
	function randomID(length: number): string {
		let result = '';
		const characters =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	$: after = $page.query.get('after');

	async function register() {
		let res = await fetch(`${backend}/register`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: chance().name(),
				password: chance().apple_token(),
			}),
		});
		if (res.ok) {
			let data = await res.json();
			document.cookie = `token=${data.token}`;
			window.location.href = after ?? '/';
		}
	}

	onMount(() => {
		register();
	});
</script>

<main>
	<Loading size={200} />
</main>
