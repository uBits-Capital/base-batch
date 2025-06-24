// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {PositionKey} from "../types/PositionKey.sol";
import {PositionId, PositionIdLib} from "../types/PositionId.sol";
import {IPoolPartyPosition} from "../interfaces/IPoolPartyPosition.sol";

interface IPoolPartyPositionFactory {
    /// @notice Emitted when the manager is destroyed
    event Destroyed();

    function pause() external;

    function unpause() external;

    function destroy() external;

    function create(
        IPoolPartyPosition.ConstructorParams memory _params
    ) external returns (IPoolPartyPosition poolPosition);

    function upgradeTo(address _impl) external;

    function getImplementation() external view returns (address);

    function getProxy(PositionId _positionId) external view returns (address);

    function updatePoolPartyPosition(
        PositionId _oldPositionId,
        PositionId _newPositionId
    ) external returns (address);

    function getPoolPartyPosition(
        PositionId _positionId
    ) external view returns (IPoolPartyPosition);
}
