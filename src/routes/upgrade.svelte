<script lang="ts">
	import { browser } from '$app/env';
	import { onDestroy, onMount } from 'svelte';

	export const hydrate = false;

	interface Plan {
		name: string;
		price: number;
		description?: string;
		features: string[];
	}

	let roots = [
		'Free',
		'Budget',
		'Starter',
		'Hobby',
		'Standard',
		'Member',
		'Supporter',
		'Pro',
		'Premium',
		'Legend',
		'Bronze',
		'Silver',
		'Gold',
		'Platinum',
		'Diamond',
		'Ruby',
		'Alpha',
		'Beta',
		'Gamma',
		'Delta',
		'Epsilon',
		'Zeta',
		'Eta',
		'Theta',
		'Iota',
		'Kappa',
		'Lambda',
		'Mu',
		'Nu',
		'Xi',
		'Omicron',
		'Pi',
		'Rho',
		'Sigma',
		'Tau',
		'Upsilon',
		'Phi',
		'Chi',
		'Psi',
		'Omega',
		'Master',
	];

	let prefixes = ['Super', 'Ultra', 'Hyper', 'Giga', 'Supreme'];

	let suffixes = [
		'More',
		'SuperExtra',
		'+',
		'++',
		'Plus',
		'SuperPlus',
		'+++',
		'++++',
		'++++ Plus',
		'++++ SuperPlus',
		'++++ SuperPlus Extra',
		'++++ SuperPlus SuperExtra',
		'++++ More SuperPlus SuperExtra',
		'++++ Super More SuperPlus SuperExtra',
		'++++ Super More SuperPlus Extra SuperExtra',
		'++++ Super More SuperPlus Extra SuperExtra SuperMore',
		'Ultimate',
	];

	let plans: Plan[] = [];

	let price = 0;

	let shownPlans: Plan[] = plans.slice(0, roots.length);

	let infiniteReference: HTMLDivElement;

	let animationFrame: number;

	function checkIfShouldLoad() {
		animationFrame = requestAnimationFrame(checkIfShouldLoad);
		if (
			infiniteReference.getBoundingClientRect().top < window.innerHeight &&
			shownPlans.length + 10 < plans.length
		) {
			shownPlans = plans.slice(0, shownPlans.length + 10);
		}
	}

	onMount(async () => {
		roots.forEach((it) => {
			plans = [
				...plans,
				{
					name: it,
					price: price,
					features: [
						'Lorem ipsum dolor ',
						'Natus ducimus consequuntur ',
						'Rerum eum fuga dolor quisquam ',
						'Sapiente labore consequuntur ',
					],
				},
			];
			if (price === 0) price = 200;
			else price += Math.ceil(Math.log(Math.floor(price / 100))) * 100;
		});
		prefixes.forEach((p) => {
			roots.forEach((it) => {
				plans = [
					...plans,
					{
						name: p + ' ' + it,
						price: price,
						features: [
							'Lorem ipsum dolor ',
							'Natus ducimus consequuntur ',
							'Rerum eum fuga dolor quisquam ',
							'Sapiente labore consequuntur ',
						],
					},
				];
				if (price === 0) price = 200;
				else price += Math.ceil(Math.log(Math.floor(price / 100))) * 100;
			});
		});
		suffixes.forEach((s) => {
			prefixes.forEach((p) => {
				roots.forEach((it) => {
					plans = [
						...plans,
						{
							name: p + ' ' + it + (s.includes('+') ? '' : ' ') + s,
							price: price,
							features: [
								'Lorem ipsum dolor ',
								'Natus ducimus consequuntur ',
								'Rerum eum fuga dolor quisquam ',
								'Sapiente labore consequuntur ',
							],
						},
					];
					if (price === 0) price = 200;
					else price += Math.ceil(Math.log(Math.floor(price / 100))) * 100;
				});
			});
		});
		checkIfShouldLoad();
	});

	onDestroy(() => {
		if (browser) cancelAnimationFrame(animationFrame);
	});

	// 	function slugify(s: string): string {
	// 		return s.toLowerCase().split(' ').join('-');
	// 	}
</script>

<main>
	<h1>Pricing</h1>
	<p class="description">
		At TicTacToeZone™, we believe high quality TicTacToe® should not be locked
		behind a paywall. That's why we offer an extremely generous free plan, and
		allow you to pay for the features you want.
	</p>
	<h2>Basic Plans</h2>
	<div class="plans">
		{#each shownPlans as plan}
			<div class="plan">
				<h3>
					{plan.name} Plan
					<span class="price">(${(plan.price ? plan.price - 1 : 0) / 100})</span
					>
				</h3>
				{#if plan.description}<p>{plan.description}</p>{/if}
				<ul class="features">
					{#each plan.features as f}<li>{f}</li>{/each}
				</ul>
				<a class="plan-buy" href="/">BUY NOW</a>
			</div>
		{/each}
		<div bind:this={infiniteReference} />
	</div>
</main>

<style lang="scss">
	.description {
		margin-bottom: 50px;
	}

	h2 {
		text-decoration: none;
		text-transform: uppercase;
		color: black;
		text-align: center;
		border-bottom: 3px solid black;
		margin-bottom: 20px;
	}

	.plans {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		@media (max-width: 600px) {
			display: block;
		}
	}

	.plan {
		background: linear-gradient(to bottom, white, #eee 90%);
		border-radius: 0.3rem;
		border: 2px solid lightgray;
		padding: 10px;
		margin: 10px;
		transition: transform 0.5s, box-shadow 0.5s;

		p {
			color: #666;
		}
	}

	.plan-buy {
		display: block;
		width: 90%;
		margin: 10px auto;
		outline: none;
		border: none;
		font: inherit;
		color: white;
		background-color: #fd9612;
		&:hover {
			background-color: orangered;
		}
		text-align: center;
		text-decoration: none;
	}

	.price {
		color: #005ec1;
	}

	h3 {
		font-weight: normal;
		font-size: 1.2rem;
		margin: 0;
		margin-bottom: 10px;
	}

	.features {
		list-style: none;
		padding: 0;
		color: #111;
		& li {
			&::before {
				color: #005ec1;
				content: '✓ ';
			}
		}
	}
</style>
