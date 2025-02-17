<script lang="ts">
  import type { CanisterDetails } from "$lib/canisters/nns-dapp/nns-dapp.types";
  import {
    type CyclesCallback,
    initCyclesWorker,
  } from "$lib/services/worker-cycles.services";
  import { onDestroy } from "svelte";
  import type { CanisterSync } from "$lib/types/canister";
  import type { PostMessageDataResponse } from "$lib/types/post-messages";
  import { isNullish, nonNullish } from "@dfinity/utils";
  import { SkeletonText } from "@dfinity/gix-components";
  import { formatNumber } from "$lib/utils/format.utils";
  import {
    canisterStatusToText,
    formatCyclesToTCycles,
  } from "$lib/utils/canisters.utils";
  import { i18n } from "$lib/stores/i18n";

  export let canister: CanisterDetails;

  let worker:
    | {
        startCyclesTimer: (params: {
          canisterId: string;
          callback: CyclesCallback;
        }) => void;
        stopCyclesTimer: () => void;
      }
    | undefined;

  onDestroy(() => worker?.stopCyclesTimer());

  const initWorker = async () => {
    worker?.stopCyclesTimer();

    worker = await initCyclesWorker();

    worker.startCyclesTimer({
      canisterId: canister.canister_id.toText(),
      callback: syncCanisterCallback,
    });
  };

  $: canister, (async () => await initWorker())();

  let canisterSync: CanisterSync | undefined = undefined;
  // Multiple workers that sync canister information can be appended to a view.
  // postMessage being broadcasted, we filter the information that matches this canister.
  const syncCanisterCallback = ({ canister: data }: PostMessageDataResponse) =>
    (canisterSync =
      data?.id === canister.canister_id.toText() ? data : undefined);
</script>

<div>
  {#if isNullish(canisterSync) || canisterSync?.sync === "syncing"}
    <p><SkeletonText /></p>
    <p><SkeletonText /></p>
    <p><SkeletonText /></p>
  {:else if canisterSync.sync === "synced" && nonNullish(canisterSync.data)}
    <p class={`${canisterSync.cyclesStatus ?? ""}`} data-tid="canister-cycles">
      <span class="value"
        >{formatCyclesToTCycles(canisterSync.data.cycles)}</span
      >
      <span class="label">{$i18n.canister_detail.t_cycles}</span>
    </p>
    <p data-tid="canister-status">
      {canisterStatusToText(canisterSync.data.status)}
    </p>
    <p data-tid="canister-memory">
      {formatNumber(Number(canisterSync.data.memorySize) / 1_000_000)} MB
    </p>
  {/if}
</div>

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    height: var(--padding-8x);
  }

  p {
    margin: 0 0 var(--padding-0_5x);
    line-height: var(--line-height-standard);
    --skeleton-text-line-height: 0.65;
  }

  .empty span {
    color: var(--negative-emphasis);
  }
</style>
