<script lang="ts">
	export let size: number;
</script>

<svg viewBox="0 0 3 3" style={`height: ${size}px;`}>
	<rect x="0.5" y="0.5" width="2" height="2" class="rect" />
</svg>

<style lang="scss">
	svg {
		display: block;
		margin: auto;
	}

	.rect {
		stroke: none;
		fill: orange;
		animation: spin 2s infinite ease-in-out;
		transform-origin: 50% 50%;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}
</style>
