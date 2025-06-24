// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {PayMaster} from "./PayMaster.sol";
import {UniswapV3Integration} from "./UniswapV3Integration.sol";
import {Rewards} from "./Rewards.sol";
import {Liquidity} from "./Liquidity.sol";
import {Core} from "./Core.sol";
import {Storage} from "../storage/PoolPartyPositionStorage.sol";
import "../interfaces/IPoolPartyPosition.sol";

library WithdrawPosition {
    using PositionIdLib for PositionKey;
    using SafeERC20 for IERC20;

    function withdraw(
        Storage storage s,
        IPoolPartyPositionView _position,
        IPoolPartyPosition.WithdrawParams calldata _params
    ) external returns (uint256, uint256, uint256, uint256) {
        //slither-disable-next-line timestamp
        require(
            _params.deadline >= block.timestamp,
            "Deadline must be in the future"
        );

        require(
            _params.investor != address(0),
            "Investor must be a non-zero address"
        );

        require(
            _params.investor != s.i_operator,
            "Investor must not be the operator"
        );

        require(
            s.liquidityOf[_params.investor] > 0,
            "Investor has no liquidity to withdraw"
        );

        if (
            _params.swap.shouldSwapFees &&
            (_params.swap.multihopSwapPath0.length == 0 &&
                _params.swap.multihopSwapPath1.length == 0)
        ) {
            revert("Multihop Swap path is required");
        }

        Liquidity.updateLiquidity(s);
        Rewards.updateRewardsOf(s, _params.investor, address(_position));

        (
            uint256 amount0,
            uint256 amount1,
            uint128 earned0,
            uint128 earned1
        ) = Core.withdraw(
                s,
                _position,
                address(_position),
                _params.investor,
                _params.deadline
            );

        (uint256 netEarned0, uint256 netEarned1) = PayMaster.splitCollectedFees(
            _position,
            _params.investor,
            earned0,
            earned1
        );

        PayMaster.transferTokens(
            _position,
            _params.investor,
            amount0 + netEarned0,
            amount1 + netEarned1,
            _params.swap
        );

        emit IPoolPartyPosition.Withdrawn(
            _params.investor,
            _position.key().toId(),
            amount0 + netEarned0,
            amount1 + netEarned1
        );

        if (s.remainingLiquidityAfterClose == 0) {
            PayMaster.withdrawRemainingTokens(_position);
        }

        return (amount0, amount1, netEarned0, netEarned1);
    }
}
