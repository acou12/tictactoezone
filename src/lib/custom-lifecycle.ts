import { page } from "$app/stores";
import { onMount } from "svelte";

export function onNavigate(fn, after = () => {}) {
  let mounted = false;

  const unsubscribe = page.subscribe(() => {
    if (mounted) {
      after();
      fn();
    }
  });

  onMount(() => {
    mounted = true;
    fn();

    return () => {
      unsubscribe();
      mounted = false;
    };
  });
}
