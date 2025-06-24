// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {Storage} from "../storage/PoolPartyPositionStorage.sol";
import {PayMaster} from "./PayMaster.sol";
import {Rewards} from "./Rewards.sol";
import {Liquidity} from "./Liquidity.sol";
import {Core} from "./Core.sol";
import "../interfaces/IPoolPartyPosition.sol";

library ClosePosition {
    using PositionIdLib for PositionKey;

    function closePosition(
        Storage storage s,
        IPoolPartyPositionView _position,
        IPoolPartyPosition.ClosePositionParams calldata _params
    ) external returns (uint128 liquidity, uint256 amount0, uint256 amount1) {
        require(!_position.isClosed(), "Position is already closed");
        require(
            _params.operator == s.i_operator,
            "Only the operator can close the pool position"
        );

        Liquidity.updateLiquidity(s);
        Rewards.updateRewardsOf(s, s.i_operator, address(_position));
        (
            uint128 _liquidity,
            uint256 decAmount0,
            uint256 decAmount1,
            uint256 collectedToken0,
            uint256 collectedToken1
        ) = Core.closePosition(s, address(_position), _params.deadline);

        bytes memory zeroBytes = bytes("");
        IPoolPartyPosition.SwapParams memory swap = IPoolPartyPosition
            .SwapParams({
                shouldSwapFees: false,
                amount0OutMinimum: 0,
                amount1OutMinimum: 0,
                multihopSwapPath0: zeroBytes,
                multihopSwapPath1: zeroBytes,
                multihopSwapRefundPath0: zeroBytes,
                multihopSwapRefundPath1: zeroBytes
            });

        (uint256 _collectedFees0, uint256 _collectedFees1) = PayMaster
            .splitCollectedFees(
                _position,
                s.i_operator,
                collectedToken0,
                collectedToken1
            );

        PayMaster.transferTokens(
            _position,
            s.i_operator,
            decAmount0 + _collectedFees0,
            decAmount1 + _collectedFees1,
            swap
        );
        return (_liquidity, decAmount0, decAmount1);
    }
}
