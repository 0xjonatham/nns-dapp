import type { WalletStore } from "$lib/types/wallet.context";
import { writable } from "svelte/store";
import { mockMainAccount } from "./accounts.store.mock";

export const mockWalletStore = writable<WalletStore>({
  account: mockMainAccount,
  neurons: [],
});
