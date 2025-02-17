<script lang="ts">
  import type { NeuronInfo } from "@dfinity/nns";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import {
    Html,
    KeyValuePair,
    KeyValuePairInfo,
  } from "@dfinity/gix-components";
  import NnsStakeMaturityButton from "./actions/NnsStakeMaturityButton.svelte";
  import SpawnNeuronButton from "./actions/SpawnNeuronButton.svelte";
  import NnsAutoStakeMaturity from "./actions/NnsAutoStakeMaturity.svelte";
  import {
    isNeuronControllable,
    formattedStakedMaturity,
    formattedTotalMaturity,
  } from "$lib/utils/neuron.utils";
  import { accountsStore } from "$lib/stores/accounts.store";
  import Separator from "$lib/components/ui/Separator.svelte";

  export let neuron: NeuronInfo;

  let isControllable: boolean;
  $: isControllable = isNeuronControllable({
    neuron,
    identity: $authStore.identity,
    accounts: $accountsStore,
  });
</script>

<CardInfo>
  <KeyValuePairInfo testId="maturity">
    <h3 slot="key">{$i18n.neuron_detail.maturity_title}</h3>
    <svelte:fragment slot="info"
      ><Html
        text={$i18n.neuron_detail.stake_maturity_tooltip}
      /></svelte:fragment
    >
    <h3 slot="value">{formattedTotalMaturity(neuron)}</h3>
  </KeyValuePairInfo>

  {#if neuron.fullNeuron?.stakedMaturityE8sEquivalent !== undefined}
    <KeyValuePair testId="staked-maturity">
      <svelte:fragment slot="key">{$i18n.neurons.staked}</svelte:fragment>
      <span slot="value" class="staked-maturity"
        >{formattedStakedMaturity(neuron)}</span
      >
    </KeyValuePair>
  {/if}

  {#if isControllable}
    <div class="actions">
      <NnsStakeMaturityButton {neuron} />
      <SpawnNeuronButton {neuron} />
    </div>
  {/if}

  <NnsAutoStakeMaturity {neuron} />
</CardInfo>

<Separator />

<style lang="scss">
  @use "../../themes/mixins/neuron";

  @include neuron.maturity-card-info;
</style>
