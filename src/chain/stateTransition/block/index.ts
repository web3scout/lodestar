/**
 * @module chain/stateTransition/block
 */

import {
  BeaconBlock,
  BeaconState,
} from "../../../types";

import {processEth1Data} from "./eth1Data";
import {processBlockHeader} from "./blockHeader";
import {processRandao} from "./randao";
import {processOperations} from "./operations";
import {verifyBlockStateRoot} from "./rootVerification";

// See https://github.com/ethereum/eth2.0-specs/blob/v0.7.1/specs/core/0_beacon-chain.md#block-processing

export function processBlock(state: BeaconState, block: BeaconBlock, verify: boolean = true): void {
  // block header
  processBlockHeader(state, block, verify);

  // RANDAO
  processRandao(state, block.body);

  // Eth1 Data
  processEth1Data(state, block.body);

  // Operations
  processOperations(state,block.body);

  if(verify) {
    // Verify block stateRoot
    verifyBlockStateRoot(state, block);
  }
}
