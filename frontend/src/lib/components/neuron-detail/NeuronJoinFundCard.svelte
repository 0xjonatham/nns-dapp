<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { accountsStore } from "$lib/stores/accounts.store";
  import { i18n } from "$lib/stores/i18n";
  import { isNeuronControllableByUser } from "$lib/utils/neuron.utils";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import JoinCommunityFundCheckbox from "./actions/JoinCommunityFundCheckbox.svelte";
  import { Html, KeyValuePairInfo } from "@dfinity/gix-components";
  import Separator from "$lib/components/ui/Separator.svelte";

  export let neuron: NeuronInfo;

  let isControlledByUser: boolean;
  $: isControlledByUser = isNeuronControllableByUser({
    neuron,
    mainAccount: $accountsStore.main,
  });
</script>

{#if isControlledByUser}
  <CardInfo>
    <KeyValuePairInfo testId="join-community-fund">
      <h3 slot="key">{$i18n.neurons.community_fund_title}</h3>

      <div class="info" slot="info">
        <Html text={$i18n.neuron_detail.community_fund_more_info} />
      </div>
    </KeyValuePairInfo>

    <div class="join">
      <JoinCommunityFundCheckbox {neuron} />
    </div>
  </CardInfo>

  <Separator />
{/if}

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  .info {
    line-height: initial;
  }

  .join {
    --checkbox-label-order: 1;
    --checkbox-padding: var(--padding) 0;
  }
</style>
