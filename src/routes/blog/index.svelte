<script context="module" lang="ts">
  import type { LoadInput, LoadOutput } from "@sveltejs/kit";

  export async function load({ page, fetch }: LoadInput): Promise<LoadOutput> {
    const res = await fetch(`${backend}/blog/`);
    const data = await res.json();

    return {
      props: {
        pages: data,
      },
    };
  }
</script>

<script lang="ts">
  import { backend } from "$lib/config";

  interface BlogPost {
    id: string;
    title: string;
    description: string;
    img: string;
  }

  export let pages: BlogPost[];
</script>

<div class="pages">
  {#each pages as page}
    <div class="page">
      <a href="/blog/{page.id}">
        <h2>{page.title}</h2>
        <p>{page.description}</p>
        <!-- <img src={page.img} alt="The image for {page.title}."> -->
      </a>
    </div>
  {/each}
  <div class="page">
    <a href="https://www.tictac.com/">
      <h2>New flavors!</h2>
      <p>
        Check out new TicTac® flavours, including Coca-Cola, X-Freeze, and Big
        Berry
      </p>
      <span class="ad">SPONSORED </span>
    </a>
  </div>
</div>
<style lang="scss">
  .ad {
    text-decoration: none;
    color: rgb(182, 181, 181);
  }

  a {
    text-decoration: none;
  }

  p {
    color: black;
  }
</style>