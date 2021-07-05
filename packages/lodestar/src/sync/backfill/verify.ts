import {allForks, CachedBeaconState} from "@chainsafe/lodestar-beacon-state-transition";
import {IBeaconConfig} from "@chainsafe/lodestar-config";
import {Root, allForks as allForkTypes, ssz} from "@chainsafe/lodestar-types";
import {IBlsVerifier} from "../../chain/bls";
import {BackfillSyncError, BackfillSyncErrorCode} from "./errors";

export async function verifyBlocks(
  config: IBeaconConfig,
  bls: IBlsVerifier,
  state: CachedBeaconState<allForks.BeaconState>,
  blocks: allForkTypes.SignedBeaconBlock[],
  anchorRoot: Root
): Promise<void> {
  if (blocks.length === 0) {
    return;
  }
  const nextRoot: Root = anchorRoot;
  for (const block of blocks.reverse()) {
    if (!ssz.Root.equals(config.getForkTypes(block.message.slot).BeaconBlock.hashTreeRoot(block.message), nextRoot)) {
      if (ssz.Root.equals(nextRoot, anchorRoot)) {
        throw new BackfillSyncError({code: BackfillSyncErrorCode.NOT_ANCHORED});
      }
      throw new BackfillSyncError({code: BackfillSyncErrorCode.NOT_LINEAR});
    }
  }
  const signatures = blocks.map((block) => allForks.getProposerSignatureSet(state, block));
  if (!(await bls.verifySignatureSets(signatures))) {
    throw new BackfillSyncError({code: BackfillSyncErrorCode.INVALID_SIGNATURE});
  }
}
