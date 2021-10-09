<script context="module" lang="ts">
  import type { LoadInput, LoadOutput } from "@sveltejs/kit";

  export async function load({
    page,
    fetch,
    session,
  }: LoadInput): Promise<LoadOutput> {
    let res = await fetch(`${backend}/game/${page.params.gameid}`);
    if (res.ok) {
      let data = await res.json();
      return {
        props: data,
      };
    }
  }
</script>

<script lang="ts">
  import { page } from "$app/stores";
  import { backend, wsBackend } from "$lib/config";
  import InteractiveBoard from "$lib/InteractiveBoard.svelte";
  import { onDestroy, onMount } from "svelte";
  import { onNavigate } from "$lib/custom-lifecycle";

  export let board: ("x" | "o" | "")[][];
  export let turn: "x" | "o";
  export let role: "x" | "o";
  export let ticket: string;

  if (!ticket) ticket = "";

  let ws: WebSocket;
  onNavigate(
    () => {
      ws = new WebSocket(
        `${wsBackend}/game/${$page.params.gameid}?ticket=${ticket}`
      );
      ws.onmessage = (e) => {
        let data = JSON.parse(e.data);
        if (data.type === "error") {
          alert(data.error);
        } else if (data.type === "move") {
          let [x, y] = data.move;
          board[x][y] = data.role;
          turn = data.role === "x" ? "o" : "x";
        }
      };
    },
    () => {
      ws.close();
    }
  );

  onDestroy(() => {
    ws?.close();
  });

  async function move(x, y) {
    if (board[x][y] !== "") return;
    if (turn !== role) return;
    turn = turn === "x" ? "o" : "x";
    board[x][y] = role;
    ws.send(
      JSON.stringify({
        type: "move",
        move: [x, y],
      })
    );
  }
</script>

<p>
  Send the following link to your opponent: <a
    href="/join/{$page.params.gameid}"
    >https://tttz.aydenmc.com/join/{$page.params.gameid}</a
  >
</p>
<div class="board">
  <InteractiveBoard interactive={role ? true : false} onclick={move} {board} />
</div>

<style lang="scss">
  .board {
    width: 500px;
    margin: auto;
  }
</style>
