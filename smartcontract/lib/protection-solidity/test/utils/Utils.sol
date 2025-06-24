// SPDX-License-Identifier: MIT
pragma solidity >=0.8.19 < 0.9.0;

import { Vm } from "forge-std/Vm.sol";

abstract contract Utils {
    uint256 private immutable _nonce;

    constructor() {
        _nonce =
            uint256(keccak256(abi.encode(tx.origin, tx.origin.balance, block.number, block.timestamp, block.coinbase)));
    }

    function _randomBytes32() internal view returns (bytes32) {
        bytes memory seed = abi.encode(_nonce, block.timestamp, gasleft());
        return keccak256(seed);
    }

    function _randomUint256() internal view returns (uint256) {
        return uint256(_randomBytes32());
    }

    function _randomAddress() internal view returns (address payable) {
        return payable(address(uint160(_randomUint256())));
    }
}
