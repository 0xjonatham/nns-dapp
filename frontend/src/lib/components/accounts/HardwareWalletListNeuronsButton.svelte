<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { listNeuronsHardwareWalletProxy } from "$lib/proxy/ledger.services.proxy";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { busy } from "@dfinity/gix-components";
  import { getContext } from "svelte";
  import type { WalletContext } from "$lib/types/wallet.context";
  import { WALLET_CONTEXT_KEY } from "$lib/types/wallet.context";
  import type { NeuronInfo } from "@dfinity/nns";
  import { mapHardwareWalletNeuronInfo } from "$lib/utils/hardware-wallet-neurons.utils";
  import { authStore } from "$lib/stores/auth.store";
  import { openWalletModal } from "$lib/utils/modals.utils";

  // Get the store for the neurons of the hardware wallet from the dedicated context
  const context: WalletContext = getContext<WalletContext>(WALLET_CONTEXT_KEY);
  const { store }: WalletContext = context;

  const listNeurons = async () => {
    startBusy({
      initiator: "accounts",
      labelKey: "busy_screen.pending_approval_hw",
    });

    const { neurons, err } = await listNeuronsHardwareWalletProxy();

    store.update((data) => ({
      ...data,
      neurons: neurons.map((neuron: NeuronInfo) =>
        mapHardwareWalletNeuronInfo({ neuron, identity: $authStore.identity })
      ),
    }));

    stopBusy("accounts");

    if (err !== undefined) {
      return;
    }

    openWalletModal({ type: "hw-list-neurons" });
  };
</script>

<button
  class="secondary"
  type="button"
  on:click={listNeurons}
  disabled={$busy}
  data-tid="ledger-list-button"
>
  {$i18n.accounts.attach_hardware_show_neurons}
</button>
