<script lang="ts">
  import { IconUser, ThemeToggle, Popover } from "@dfinity/gix-components";
  import Logout from "./Logout.svelte";
  import LoginIconOnly from "./LoginIconOnly.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { authStore } from "$lib/stores/auth.store";

  let visible = false;
  let button: HTMLButtonElement | undefined;

  let signedIn = false;
  $: signedIn = isSignedIn($authStore.identity);

  const toggle = () => (visible = !visible);
</script>

{#if signedIn}
  <button
    data-tid="account-menu"
    class="icon-only toggle"
    bind:this={button}
    on:click={toggle}
    aria-label={$i18n.header.account_menu}
  >
    <IconUser />
  </button>

  <Popover bind:visible anchor={button} direction="rtl">
    <div class="info">
      <ThemeToggle />

      <Logout on:nnsLogoutTriggered={toggle} />
    </div>
  </Popover>
{:else}
  <LoginIconOnly />
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/header";

  .info {
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }

  .toggle {
    justify-self: flex-end;

    @include header.button(--primary-tint);
  }
</style>
