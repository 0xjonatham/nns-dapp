<script lang="ts">
  import type { Account } from "$lib/types/account";
  import type { Principal } from "@dfinity/principal";
  import { InfiniteScroll, Spinner } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import IcrcTransactionCard from "./IcrcTransactionCard.svelte";
  import SkeletonCard from "../ui/SkeletonCard.svelte";
  import type { IcrcTransactionData } from "$lib/types/transaction";

  export let account: Account;
  export let transactions: IcrcTransactionData[];
  export let loading: boolean;
  export let governanceCanisterId: Principal | undefined = undefined;
  export let completed = false;
</script>

<div data-tid="transactions-list">
  {#if transactions.length === 0 && !loading}
    {$i18n.wallet.no_transactions}
  {:else if transactions.length === 0 && loading}
    <SkeletonCard cardType="info" />
    <SkeletonCard cardType="info" />
  {:else}
    <InfiniteScroll on:nnsIntersect disabled={loading || completed}>
      {#each transactions as { transaction, toSelfTransaction } (`${transaction.id}-${toSelfTransaction ? "0" : "1"}`)}
        <IcrcTransactionCard
          transactionWithId={transaction}
          {toSelfTransaction}
          {account}
          {governanceCanisterId}
        />
      {/each}
    </InfiniteScroll>
    {#if loading}
      <Spinner inline />
    {/if}
  {/if}
</div>
