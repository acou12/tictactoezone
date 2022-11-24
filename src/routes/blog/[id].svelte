<script context="module" lang="ts">
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';
	import { backend } from '$lib/config';
	import InteractiveBoard from '$lib/InteractiveBoard.svelte';

	export async function load({ page, fetch }: LoadInput): Promise<LoadOutput> {
		const res = await fetch(`${backend}/blog/${page.params.id}`);
		if (res.ok) {
			if (page.params.id === 'refresh') {
				return {
					status: 302,
					redirect: '/blog',
				};
			}
			const data = await res.json();

			return {
				props: {
					data,
				},
			};
		}
	}
</script>

<script lang="ts">
	import marked from 'marked';

	interface BlogPost {
		id: string;
		title: string;
		description: string;
		body: string;
		img: string;
	}

	type Tile = 'x' | 'o' | '';

	export let data: BlogPost;
	let sections: (string | { board: Tile[][] })[];

	$: {
		sections = data.body.split('\n\n');

		for (let i = 0; i < sections.length; i++) {
			if ((sections[i] as string).startsWith('@board')) {
				sections[i] = {
					board: (sections[i] as string)
						.slice(7)
						.replace(/\|/g, '')
						.split('\n')
						.map((row) => row.split('')) as Tile[][],
				};
			} else {
				sections[i] = marked(sections[i] as string);
			}
		}
	}
</script>

<main>
	<article>
		<h1>{data.title}</h1>
		{#each sections as s}
			{#if typeof s === 'string'}
				<p>{@html s}</p>
			{:else}
				<div class="board">
					<InteractiveBoard
						board={s.board}
						interactive={false}
						onclick={() => {}}
					/>
				</div>
			{/if}
		{/each}
	</article>
</main>

<style lang="scss">
	.board {
		width: 300px;
		margin: auto;
	}

	article {
		& :global(p) {
			margin-bottom: 20px;
		}
		& :global(em) {
			display: block;
			text-decoration: none;
			font-style: italic;
			color: gray;
			text-align: center;
		}
		& :global(h1) {
			font-size: 2rem;
		}
	}
</style>
