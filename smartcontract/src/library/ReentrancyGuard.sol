/// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

uint256 constant NOT_ENTERED = 1;
uint256 constant ENTERED = 2;

/**
 * @dev Unauthorized reentrant call.
 */
error ReentrancyGuardReentrantCall();

/**
 * @notice The following are the ReentrancyGuard functions from the OZ implementation.
 * @author uBits Capital - but copied from the OZ implementation and modified to be used as custom library
 */
library LibReentrancyGuard {
    /***************************************************************************************
               Library to support the Facets 
    ****************************************************************************************/

    /** ==================================================================
                            ReentrancyGuard Storage Space
    =====================================================================*/
    // each facet gets their own struct to store state into
    bytes32 constant REENTRANCY_GUARD_STORAGE_POSITION =
        keccak256("reentrancy.guard.storage");

    /**
     * @notice ReentrancyGuard storage for the ReentrancyGuard facet
     */
    struct Storage {
        mapping(address _contract => mapping(bytes32 tag => uint256)) _status;
    }

    function getStorage() internal pure returns (Storage storage ds) {
        bytes32 position = REENTRANCY_GUARD_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    function _nonReentrantBefore(address _contract, bytes32 _tag) external {
        Storage storage ds = getStorage();
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (ds._status[_contract][_tag] == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        ds._status[_contract][_tag] = ENTERED;
    }

    function _nonReentrantAfter(address _contract, bytes32 _tag) external {
        Storage storage ds = getStorage();
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        ds._status[_contract][_tag] = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    // slither-disable-next-line dead-code
    function _reentrancyGuardEntered(
        address _contract,
        bytes32 _tag
    ) internal view returns (bool) {
        Storage storage ds = getStorage();
        return ds._status[_contract][_tag] == ENTERED;
    }
}

/**
 * @title ReentrancyGuardByTag
 * @dev This contract provides protection against reentrant calls to functions, defined in LibReentrancyGuard.
 */
abstract contract ReentrancyGuardByTag {
    constructor() {
        LibReentrancyGuard.Storage storage ds = LibReentrancyGuard.getStorage();
        ds._status[address(this)][""] = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling one `nonReentrant` function from another is not supported. Instead, you can implement a
     * `private` function doing the actual work, and a `external` wrapper marked as `nonReentrant`.
     */
    modifier nonReentrantByTag(bytes32 _tag) {
        LibReentrancyGuard._nonReentrantBefore(address(this), _tag);
        _;
        LibReentrancyGuard._nonReentrantAfter(address(this), _tag);
    }
}
