<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		document.cookie = 'token=; path=/';
		window.location.href = '/';
	});
</script>
