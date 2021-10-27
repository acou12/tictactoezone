<script context="module" lang="ts">
	import { backend } from '$lib/config';
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';

	export async function load({
		page,
		fetch,
		session,
	}: LoadInput): Promise<LoadOutput> {
		if (!session.authenticated) {
			return { status: 302, redirect: `/login?after=${page.path}` };
		}
		let res = await fetch(`${backend}/join/${page.params.gameid}`, {
			method: 'POST',
		});
		return {
			status: 302,
			redirect: `/game/${page.params.gameid}`,
		};
	}
</script>
