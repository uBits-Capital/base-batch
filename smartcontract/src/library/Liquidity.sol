// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {PayMaster} from "./PayMaster.sol";
import {UniswapV3Integration} from "./UniswapV3Integration.sol";
import {Rewards} from "./Rewards.sol";
import {Core} from "./Core.sol";
import {Storage} from "../storage/PoolPartyPositionStorage.sol";
import "../interfaces/IPoolPartyPosition.sol";

library Liquidity {
    using PositionIdLib for PositionKey;
    using SafeERC20 for IERC20;

    function increaseLiquidty(
        Storage storage s,
        IPoolPartyPositionView _position,
        IPoolPartyPosition.IncreaseLiquidityParams calldata _params
    ) external returns (uint128 _liquidity, uint256 amount0, uint256 amount1) {
        PositionId positionId = s.positionKey.toId();

        require(!_position.isClosed(), "Position is already closed");

        //slither-disable-next-line timestamp
        require(
            _params.deadline >= block.timestamp,
            "Deadline must be in the future"
        );
        require(
            _params.amount0USDC > 0 || _params.amount1USDC > 0,
            "At least one of amount0USDC or amount1USDC must be greater than 0"
        );

        require(
            _params.swap.shouldSwapFees &&
                (_params.swap.multihopSwapPath0.length > 0 ||
                    _params.swap.multihopSwapPath1.length > 0),
            "Multihop Swap path is required"
        );

        updateLiquidity(s);
        Rewards.updateRewardsOf(s, _params.investor, address(_position));

        uint256 amount0Desired = 0;
        uint256 amount1Desired = 0;
        if (_params.amount0USDC > 0) {
            IERC20(s.i_usdc).safeTransferFrom(
                msg.sender,
                address(_position),
                _params.amount0USDC
            );

            amount0Desired = PayMaster.swapFromUSDC(
                _position,
                s.i_token0,
                _params.swap.multihopSwapPath0,
                _params.amount0USDC,
                address(_position),
                _params.swap.amount0OutMinimum
            );
        }
        if (_params.amount1USDC > 0) {
            IERC20(s.i_usdc).safeTransferFrom(
                msg.sender,
                address(_position),
                _params.amount1USDC
            );

            amount1Desired = PayMaster.swapFromUSDC(
                _position,
                s.i_token1,
                _params.swap.multihopSwapPath1,
                _params.amount1USDC,
                address(_position),
                _params.swap.amount1OutMinimum
            );
        }

        //slither-disable-next-line unused-return,reentrancy-no-eth
        require(
            IERC20(s.i_token0).approve(
                address(_position.nonfungiblePositionManager()),
                amount0Desired
            ),
            "Approval failed for i_token0"
        );
        //slither-disable-next-line unused-return,reentrancy-no-eth
        require(
            IERC20(s.i_token1).approve(
                address(_position.nonfungiblePositionManager()),
                amount1Desired
            ),
            "Approval failed for i_token1"
        );

        (_liquidity, amount0, amount1) = UniswapV3Integration.increase({
            s: s,
            _amount0Desired: amount0Desired,
            _amount1Desired: amount1Desired,
            _amount0Min: _params.ignoreSlippage
                ? 0
                : PayMaster.computeMinAmount(amount0Desired),
            _amount1Min: _params.ignoreSlippage
                ? 0
                : PayMaster.computeMinAmount(amount1Desired),
            _deadline: _params.deadline
        });

        try
            UniswapV3Integration.getAmountsFromLiquidity(s, _liquidity)
        returns (uint256 _amount0, uint256 _amount1) {
            if (_amount0 > amount0 || _amount1 > amount1) {
                revert("Invalid liquidity amount calculation");
            }
        } catch {
            revert("Invalid liquidity amount calculation");
        }

        if (
            amount0Desired - amount0 > 10 &&
            _params.swap.multihopSwapRefundPath0.length > 0
        ) {
            PayMaster.swapToUSDC(
                _position,
                s.i_token0,
                _params.swap.multihopSwapRefundPath0,
                amount0Desired - amount0,
                _params.investor,
                0
                // PayMaster.computeMinAmount(amount0Desired - amount0)
            );
        }

        if (
            amount1Desired - amount1 > 10 &&
            _params.swap.multihopSwapRefundPath1.length > 0
        ) {
            PayMaster.swapToUSDC(
                _position,
                s.i_token1,
                _params.swap.multihopSwapRefundPath1,
                amount1Desired - amount1,
                _params.investor,
                0
                // PayMaster.computeMinAmount(amount1Desired - amount1)
            );
        }

        s.liquidityOf[_params.investor] += _liquidity;
        updateLiquidity(s);

        emit IPoolPartyPosition.LiquidityAdded(
            _params.investor,
            positionId,
            _liquidity,
            amount0,
            amount1
        );

        return (_liquidity, amount0, amount1);
    }

    function decreaseLiquidity(
        Storage storage s,
        IPoolPartyPositionView _position,
        IPoolPartyPosition.DecreaseLiquidityParams calldata _params
    ) external returns (uint128, uint256, uint256) {
        require(!_position.isClosed(), "Position is already closed");
        //slither-disable-next-line timestamp
        require(
            _params.deadline >= block.timestamp,
            "Deadline must be in the future"
        );
        require(
            _params.percentage >= 1e15 && _params.percentage <= 100e15,
            "Percentage must be between 1e15 and 100e15"
        );
        if (
            _params.swap.shouldSwapFees &&
            (_params.swap.multihopSwapPath0.length == 0 &&
                _params.swap.multihopSwapPath1.length == 0)
        ) {
            revert("Multihop Swap path is required");
        }

        require(
            s.liquidityOf[_params.investor] > 0,
            "Investor has no liquidity"
        );

        updateLiquidity(s);
        Rewards.updateRewardsOf(s, _params.investor, address(_position));

        uint128 removeLiquidity = uint128(
            (_params.percentage * s.liquidityOf[_params.investor]) /
                (100 * PERCENTAGE_MULTIPLIER)
        );

        if (_params.investor == s.i_operator) {
            /// @dev check if operator is removing more than 50% of his liquidity. If so, we close the position
            if (removeLiquidity > (s.liquidityOf[_params.investor] / 2)) {
                (
                    uint128 _liquidity,
                    uint256 _decAmount0,
                    uint256 _decAmount1,
                    uint256 collectedToken0,
                    uint256 collectedToken1
                ) = Core.closePosition(s, address(_position), _params.deadline);

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
                    _decAmount0 + _collectedFees0,
                    _decAmount1 + _collectedFees1,
                    _params.swap
                );
                return (_liquidity, _decAmount0, _decAmount1);
            }
        }

        require(
            removeLiquidity <= s.liquidity &&
                removeLiquidity <= s.liquidityOf[_params.investor],
            "removeLiquidity must not be greater than s.liquidity and investor's liquidity"
        );

        (
            uint256 decAmount0,
            uint256 decAmount1,
            uint256 amount0Uniswap,
            uint256 amount1Uniswap
        ) = Core.decrease(
                s,
                _params.investor,
                removeLiquidity,
                _params.amount0Min,
                _params.amount1Min,
                _params.deadline
            );

        uint256 earned0 = s.earned0Of[_params.investor];
        uint256 earned1 = s.earned1Of[_params.investor];

        // @dev collect rewards + decreased amount for the investor after removing liquidity,
        // because uniswap does not transfer the decreased amount to our contract
        Core.collect(
            s,
            address(_position),
            _params.investor,
            uint128(earned0 + amount0Uniswap),
            uint128(earned1 + amount1Uniswap)
        );

        (uint256 collectedFees0, uint256 collectedFees1) = PayMaster
            .splitCollectedFees(_position, _params.investor, earned0, earned1);

        PayMaster.transferTokens(
            _position,
            _params.investor,
            decAmount0 + collectedFees0,
            decAmount1 + collectedFees1,
            _params.swap
        );

        return (removeLiquidity, decAmount0, decAmount1);
    }

    function updateLiquidity(Storage storage s) internal {
        // slither-disable-start reentrancy-no-eth,unused-return
        (, , s.liquidity, , ) = UniswapV3Integration.getPoolPositionInfo(s);
        // slither-disable-end reentrancy-no-eth,unused-return
    }
}
