<script lang="ts">
  type Tile = "x" | "o" | "";
  export let board: Tile[][] = [
    ["o", "x", ""],
    ["", "o", ""],
    ["", "x", "o"],
  ];
  export let onclick: (x: number, y: number) => void;
  export let interactive: boolean = true;
</script>

<svg viewBox="-0.5 -0.5 4 4" xmlns="http://www.w3.org/2000/svg">
  <g class="lines">
    {#each board as row, x}
      {#each row as tile, y}
        {#if tile === "o"}
          <circle
            class="o"
            cx={y + 0.5}
            cy={x + 0.5}
            r="0.35"
            stroke-width="0.1"
          />
        {:else if tile === "x"}
          <path
            class="x"
            d="M{y + 0.25},{x + 0.25} L{y + 0.75},{x + 0.75} M{y + 0.75},{x +
              0.25} L{y + 0.25},{x + 0.75}"
            stroke-width="0.1"
          />
        {:else}
          <rect
            class:select={interactive}
            {x}
            {y}
            rx="0.01"
            width="1"
            height="1"
            stroke="none"
            on:click={() => onclick(x, y)}
          />
        {/if}
      {/each}
    {/each}
    <path d="M 1 0 l 0 3" />
    <path d="M 2 0 l 0 3" />
    <path d="M 0 1 l 3 0" />
    <path d="M 0 2 l 3 0" />
  </g>
</svg>

<style lang="scss">
  .lines {
    fill: none;
    stroke: black;
    stroke-width: 0.1;
    stroke-linecap: round;
  }

  .select {
    fill: transparent;
    stroke: transparent;
    &:hover {
      fill: #eeeeee;
      stroke: #eeeeee;
    }
  }

  .x {
    stroke: #ff7f2a;
  }

  .o {
    stroke: #4f9fe6;
  }
</style>
