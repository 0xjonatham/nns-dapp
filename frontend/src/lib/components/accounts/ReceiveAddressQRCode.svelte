<script lang="ts">
  import { Copy, KeyValuePair, QRCode } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import Logo from "$lib/components/ui/Logo.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { QR_CODE_RENDERED } from "$lib/constants/environment.constants";

  export let address: string;
  export let qrCodeLabel: string;
  export let logo: string;
  export let logoArialLabel: string;
  export let logoSize: "huge" | "big" = "huge";
  // Render the QR-code when the space is available / rendered to avoid UI glitch.
  export let renderQRCode = false;

  export let qrCodeRendered: boolean = QR_CODE_RENDERED;
</script>

<div class="content">
  <div class="description">
    <h3><slot name="title" /></h3>
    <p><slot name="description" /></p>

    <div class="separator">
      <Separator />
    </div>
  </div>

  <article class="qrcode">
    {#if renderQRCode}
      <QRCode
        value={address}
        ariaLabel={qrCodeLabel}
        on:nnsQRCodeRendered={() => (qrCodeRendered = true)}
      >
        <div class="logo" slot="logo">
          {#if qrCodeRendered}
            <Logo
              src={logo}
              size={logoSize}
              framed={false}
              testId="logo"
              alt={logoArialLabel}
            />
          {/if}
        </div>
      </QRCode>
    {/if}
  </article>

  <div>
    <KeyValuePair>
      <span slot="key" class="label">{$i18n.accounts.address}</span>
      <div slot="value" class="address">
        <span class="value">{address}</span>
        <Copy value={address} />
      </div>
    </KeyValuePair>
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    @include media.min-width(medium) {
      display: grid;
      grid-template-columns: repeat(2, 50%);
      grid-template-rows: auto 1fr;
      grid-row-gap: 0;

      padding: var(--padding-2x) 0;
    }
  }

  .separator {
    display: none;

    @include media.min-width(medium) {
      display: block;
    }
  }

  .address {
    display: flex;
  }

  .value {
    word-break: break-word;
    margin-top: 4px;
  }

  .qrcode {
    padding: var(--padding-2x) var(--padding-8x);

    @include media.min-width(medium) {
      grid-column: 2 / 3;
      grid-row: 1 / 3;

      padding: 0 var(--padding-4x);
    }
  }

  .description {
    @include media.min-width(medium) {
      grid-column: 1 / 2;
      margin-top: 0;
    }
  }

  .logo {
    width: calc(10 * var(--padding));
    height: calc(10 * var(--padding));
    background: var(--overlay-content-background);

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: var(--border-radius);
  }
</style>
