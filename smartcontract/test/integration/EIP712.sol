// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {PermitHash} from "@uniswap/permit2/src/libraries/PermitHash.sol";
import {IAllowanceTransfer} from "@uniswap/permit2/src/interfaces/IAllowanceTransfer.sol";
import {console} from "forge-std/Test.sol";

interface IEIP712 {
    function DOMAIN_SEPARATOR() external view returns (bytes32);
}

/// @notice EIP712 helpers for permit2
/// @dev Maintains cross-chain replay protection in the event of a fork
/// @dev Reference: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/cryptography/EIP712.sol
contract EIP712 is IEIP712 {
    using PermitHash for IAllowanceTransfer.PermitSingle;
    using PermitHash for IAllowanceTransfer.PermitBatch;

    // Cache the domain separator as an immutable value, but also store the chain id that it
    // corresponds to, in order to invalidate the cached domain separator if the chain id changes.
    bytes32 private immutable _CACHED_DOMAIN_SEPARATOR;
    uint256 private immutable _CACHED_CHAIN_ID;

    bytes32 private constant _HASHED_NAME = keccak256("Permit2");
    bytes32 private constant _TYPE_HASH =
        keccak256(
            "EIP712Domain(string name,uint256 chainId,address verifyingContract)"
        );

    address public immutable PERMIT2;

    constructor(address _permit2) {
        _CACHED_CHAIN_ID = block.chainid;
        _CACHED_DOMAIN_SEPARATOR = _buildDomainSeparator(
            _TYPE_HASH,
            _HASHED_NAME
        );
        PERMIT2 = _permit2;
    }

  function hashTypedDataPermitSingle(
        IAllowanceTransfer.PermitSingle calldata _single
    ) external view returns (bytes32) {
        return _hashTypedData(_single.hash());
    }
    function hashTypedDataPermitBatch(
        IAllowanceTransfer.PermitBatch calldata _batch
    ) external view returns (bytes32) {
        return _hashTypedData(_batch.hash());
    }

    /// @notice Returns the domain separator for the current chain.
    /// @dev Uses cached version if chainid and address are unchanged from construction.
    function DOMAIN_SEPARATOR() public view override returns (bytes32) {
        if (block.chainid == 42161) {
            return
                0x8a6e6e19bdfb3db3409910416b47c2f8fc28b49488d6555c7fceaa4479135bc3; // Arbitrum One
        } else {
            return
                0x97caedc57dcfc2ae625d68b894a8a814d7be09e29aa5321eebada2423410d9d0; // Arbitrum Sepolia
        }
        // block.chainid == _CACHED_CHAIN_ID
        //     ? _CACHED_DOMAIN_SEPARATOR
        //     : _buildDomainSeparator(_TYPE_HASH, _HASHED_NAME);
    }

    /// @notice Builds a domain separator using the current chainId and contract address.
    function _buildDomainSeparator(
        bytes32 typeHash,
        bytes32 nameHash
    ) private view returns (bytes32) {
        return
            keccak256(
                abi.encode(typeHash, nameHash, block.chainid, address(PERMIT2))
            );
    }

    /// @notice Creates an EIP-712 typed data hash
    function _hashTypedData(bytes32 dataHash) internal view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR(), dataHash)
            );
    }
}
