<script lang="ts">
  import { authStore } from "$lib/stores/auth.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { i18n } from "$lib/stores/i18n";
  import { toastsError } from "$lib/stores/toasts.store";
  import { Spinner } from "@dfinity/gix-components";
  import { layoutAuthReady } from "$lib/stores/layout.store";

  // Asks the user to authenticate themselves with a TPM or similar.
  const signIn = async () => {
    const onError = (err: unknown) =>
      toastsError({
        labelKey: "error.sign_in",
        err,
      });

    await authStore.signIn(onError);
  };

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  let disabled = true;
  $: disabled = signedIn || !$layoutAuthReady;
</script>

<button on:click={signIn} data-tid="login-button" class="primary" {disabled}>
  <slot>{$i18n.auth.login}</slot>
  {#if disabled}
    <div class="spinner">
      <Spinner size="small" inline />
    </div>
  {/if}
</button>

<style lang="scss">
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: center;

    .spinner {
      margin-left: var(--padding);
    }
  }
</style>
