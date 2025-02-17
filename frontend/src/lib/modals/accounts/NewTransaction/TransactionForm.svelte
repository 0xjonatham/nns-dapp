<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { InvalidAmountError } from "$lib/types/neurons.errors";
  import {
    assertEnoughAccountFunds,
    invalidAddress,
    isAccountHardwareWallet,
  } from "$lib/utils/accounts.utils";
  import { getMaxTransactionAmount } from "$lib/utils/token.utils";
  import SelectAccountDropdown from "$lib/components/accounts/SelectAccountDropdown.svelte";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import AmountInput from "$lib/components/ui/AmountInput.svelte";
  import { KeyValuePair } from "@dfinity/gix-components";
  import SelectDestinationAddress from "$lib/components/accounts/SelectDestinationAddress.svelte";
  import { TokenAmount, type Token } from "@dfinity/nns";
  import { NotEnoughAmountError } from "$lib/types/common.errors";
  import type { Principal } from "@dfinity/principal";
  import { translate } from "$lib/utils/i18n.utils";
  import SelectNetworkDropdown from "$lib/components/accounts/SelectNetworkDropdown.svelte";
  import type {
    TransactionNetwork,
    ValidateAmountFn,
  } from "$lib/types/transaction";
  import { isNullish } from "@dfinity/utils";

  // Tested in the TransactionModal
  export let rootCanisterId: Principal;
  export let selectedAccount: Account | undefined = undefined;
  export let canSelectDestination: boolean;
  export let canSelectSource: boolean;
  export let selectedDestinationAddress: string | undefined = undefined;
  export let amount: number | undefined = undefined;
  export let token: Token;
  export let transactionFee: TokenAmount;
  // TODO: Handle min and max validations inline: https://dfinity.atlassian.net/browse/L2-798
  export let maxAmount: bigint | undefined = undefined;
  export let skipHardwareWallets = false;
  export let showManualAddress = true;

  export let mustSelectNetwork = false;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;

  export let validateAmount: ValidateAmountFn = () => undefined;

  let filterDestinationAccounts: (account: Account) => boolean;
  $: filterDestinationAccounts = (account: Account) => {
    return (
      account.identifier !== selectedAccount?.identifier ||
      (skipHardwareWallets && isAccountHardwareWallet(account))
    );
  };

  let max = 0;
  $: max = getMaxTransactionAmount({
    balance: selectedAccount?.balance.toE8s(),
    fee: transactionFee.toE8s(),
    maxAmount,
  });
  const addMax = () => (amount = max);

  let disableButton: boolean;
  $: disableButton =
    selectedAccount === undefined ||
    amount === 0 ||
    amount === undefined ||
    invalidAddress({
      address: selectedDestinationAddress,
      network: selectedNetwork,
      rootCanisterId,
    }) ||
    errorMessage !== undefined ||
    (mustSelectNetwork && isNullish(selectedNetwork));

  let errorMessage: string | undefined = undefined;
  $: (() => {
    // Remove error message when resetting amount or source account
    if (amount === undefined || selectedAccount === undefined) {
      errorMessage = undefined;
      return;
    }
    try {
      const tokens = TokenAmount.fromNumber({ amount, token });
      assertEnoughAccountFunds({
        account: selectedAccount,
        amountE8s: tokens.toE8s() + transactionFee.toE8s(),
      });
      errorMessage = validateAmount({ amount, selectedAccount });
    } catch (error: unknown) {
      if (error instanceof NotEnoughAmountError) {
        errorMessage = $i18n.error.insufficient_funds;
        return;
      }
      if (error instanceof InvalidAmountError) {
        errorMessage = $i18n.error.amount_not_valid;
        return;
      }
      if (error instanceof Error) {
        errorMessage = translate({ labelKey: error.message });
      }
    }
  })();
  const dispatcher = createEventDispatcher();
  const close = () => {
    dispatcher("nnsClose");
  };

  const goNext = () => {
    dispatcher("nnsNext");
  };

  // TODO(GIX-1332): if destination address is selected, select corresponding network
  // TODO: if network changes, reset destination address or display error?
</script>

<form on:submit|preventDefault={goNext} data-tid="transaction-step-1">
  <div class="select-account">
    <KeyValuePair>
      <span slot="key" class="label">{$i18n.accounts.source}</span>
      <!-- svelte:fragment needed to avoid warnings -->
      <!-- Svelte issue: https://github.com/sveltejs/svelte/issues/5604 -->
      <svelte:fragment slot="value">
        {#if selectedAccount !== undefined}
          <AmountDisplay singleLine amount={selectedAccount?.balance} />
        {/if}
      </svelte:fragment>
    </KeyValuePair>

    {#if canSelectSource}
      <SelectAccountDropdown {rootCanisterId} bind:selectedAccount />
    {:else}
      <div class="given-source">
        <p>
          {selectedAccount?.name ?? $i18n.accounts.main}
        </p>
        <p class="account-identifier">
          {selectedAccount?.identifier}
        </p>
      </div>
    {/if}
  </div>

  {#if canSelectDestination}
    <SelectDestinationAddress
      {rootCanisterId}
      filterAccounts={filterDestinationAccounts}
      bind:selectedDestinationAddress
      bind:showManualAddress
      {selectedNetwork}
    />
  {/if}

  {#if mustSelectNetwork}
    <SelectNetworkDropdown
      bind:selectedNetwork
      universeId={rootCanisterId}
      {selectedDestinationAddress}
    />
  {/if}

  <div class="amount">
    <AmountInput bind:amount on:nnsMax={addMax} {max} {errorMessage} />
    <slot name="additional-info" />

    <p class="fee description">
      {$i18n.accounts.transaction_fee}: <AmountDisplay
        amount={transactionFee}
        singleLine
      />
    </p>
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      data-tid="transaction-button-cancel"
      type="button"
      on:click={close}>{$i18n.core.cancel}</button
    >
    <button
      class="primary"
      data-tid="transaction-button-next"
      disabled={disableButton}
      type="submit">{$i18n.core.continue}</button
    >
  </div>
</form>

<style lang="scss">
  form {
    --dropdown-width: 100%;
    gap: var(--padding-2x);
  }

  .select-account {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .amount {
    margin-top: var(--padding);
    --input-error-wrapper-padding: 0 0 var(--padding-2x);
  }

  .account-identifier {
    word-break: break-all;
  }

  .given-source {
    p {
      margin: 0;
    }
  }

  .fee {
    text-align: right;
    padding-top: var(--padding-0_5x);
  }
</style>
