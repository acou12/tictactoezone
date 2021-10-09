<script lang="ts">
  import { backend } from "$lib/config";
  import Loading from "$lib/Loading.svelte";

  let loggingIn = false;
  let error = "";

  let numErrors = 0;

  async function register() {
    loggingIn = true;
    let res = await fetch(`${backend}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    if (res.ok) {
      let data = await res.json();
      document.cookie = `token=${data.token}`;
      window.location.href = "/";
    } else {
      loggingIn = false;
      if (res.status === 409) {
        error = "Username already exists";
      } else {
        if (numErrors < 2) {
          error =
            "There was an error when processing your registration. Try again in like, 5 seconds.";
          numErrors++;
        } else {
          error = "Okay... something's broken.";
        }
      }
    }
  }

  let username: string;
  let password: string;
</script>

{#if loggingIn}
  <Loading size={200} />
{:else}
  <h1>Register</h1>
  <form on:submit|preventDefault={register}>
    <input type="text" placeholder="Username" bind:value={username} />
    <input type="password" placeholder="Password" bind:value={password} />
    <input type="submit" value="Login" />
  </form>
  <p>Or <a href="/login">login</a>, if you already have an account.</p>
  <p class="error">{error}</p>
{/if}

<style lang="scss">
  @import "forms";
</style>
