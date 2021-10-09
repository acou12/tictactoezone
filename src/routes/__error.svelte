<script context="module" lang="ts">
  import type { ErrorLoadInput, LoadOutput } from "@sveltejs/kit";

  export async function load({
    page,
    error,
    status,
  }: ErrorLoadInput): Promise<LoadOutput> {
    return {
      props: {
        error: error,
        status: status,
      },
    };
  }
</script>

<script lang="ts">
  import { dev } from "$app/env";

  export let error;
  export let status;
</script>

<h1>{status}</h1>
{#if dev}
  <p>{error.message}</p>
  <p>{error.stack}</p>
{:else}
  <p>Whoops!</p>
{/if}