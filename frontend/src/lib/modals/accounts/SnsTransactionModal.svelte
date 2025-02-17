<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NewTransaction } from "$lib/types/transaction";
  import TransactionModal from "./NewTransaction/TransactionModal.svelte";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { snsTransferTokens } from "$lib/services/sns-accounts.services";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import type { Account } from "$lib/types/account";
  import { Modal, Spinner, type WizardStep } from "@dfinity/gix-components";

  // TODO: Refactor to expect as props the rootCanisterId, transactionFee and token.
  // This way we can reuse this component in a dashboard page.
  export let selectedAccount: Account | undefined = undefined;
  export let loadTransactions = false;

  let currentStep: WizardStep;

  $: title =
    currentStep?.name === "Form"
      ? $i18n.accounts.send
      : $i18n.accounts.you_are_sending;

  const dispatcher = createEventDispatcher();
  const transfer = async ({
    detail: { sourceAccount, amount, destinationAddress },
  }: CustomEvent<NewTransaction>) => {
    startBusy({
      initiator: "accounts",
    });

    const { success } = await snsTransferTokens({
      source: sourceAccount,
      destinationAddress,
      amount,
      loadTransactions,
      rootCanisterId: $selectedUniverseIdStore,
    });

    stopBusy("accounts");

    if (success) {
      toastsSuccess({ labelKey: "accounts.transaction_success" });
      dispatcher("nnsClose");
    }
  };
</script>

{#if $snsSelectedTransactionFeeStore !== undefined}
  <TransactionModal
    rootCanisterId={$selectedUniverseIdStore}
    on:nnsSubmit={transfer}
    on:nnsClose
    bind:currentStep
    token={$snsTokenSymbolSelectedStore}
    transactionFee={$snsSelectedTransactionFeeStore}
    sourceAccount={selectedAccount}
  >
    <svelte:fragment slot="title"
      >{title ?? $i18n.accounts.send}</svelte:fragment
    >
    <p slot="description" class="value">
      {replacePlaceholders($i18n.accounts.sns_transaction_description, {
        $token: $snsTokenSymbolSelectedStore?.symbol ?? "",
      })}
    </p>
  </TransactionModal>
{:else}
  <!-- A toast error is shown if there is an error fetching the transaction fee -->
  <!-- TODO: replace with busy spinner pattern as in <SnsIncreateStakeNeuronModal /> -->
  <Modal on:nnsClose>
    <svelte:fragment slot="title"
      >{title ?? $i18n.accounts.send}</svelte:fragment
    ><Spinner /></Modal
  >
{/if}
