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
		console.log(session);
		let data = await fetch(`${backend}/game`, {
			method: 'POST',
		});
		if (data.ok) {
			return {
				status: 302,
				redirect: `/game/${(await data.json()).gameID}`,
			};
		} else {
			return {
				status: data.status,
			};
		}
	}
</script>
