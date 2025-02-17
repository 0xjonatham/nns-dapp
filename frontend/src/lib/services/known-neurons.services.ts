import * as api from "$lib/api/governance.api";
import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
import { toastsError } from "$lib/stores/toasts.store";
import type { KnownNeuron } from "@dfinity/nns";
import { queryAndUpdate } from "./utils.services";

export const listKnownNeurons = (): Promise<void> => {
  return queryAndUpdate<KnownNeuron[], unknown>({
    request: (options) => api.queryKnownNeurons(options),
    onLoad: ({ response: neurons }) => knownNeuronsStore.setNeurons(neurons),
    onError: ({ error: err, certified, identity }) => {
      console.error(err);

      if (certified || identity.getPrincipal().isAnonymous()) {
        knownNeuronsStore.setNeurons([]);

        toastsError({
          labelKey: "error.get_known_neurons",
          err,
        });
      }
    },
    logMessage: "Syncing Known Neurons",
  });
};
