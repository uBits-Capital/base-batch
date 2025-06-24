// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {UniswapV3Integration} from "./UniswapV3Integration.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {Rewards} from "./Rewards.sol";
import {Liquidity} from "./Liquidity.sol";
import {ClosePosition} from "./ClosePosition.sol";
import {Storage} from "../storage/PoolPartyPositionStorage.sol";
import "../interfaces/IPoolPartyPosition.sol";

library Core {
    using PositionIdLib for PositionKey;

    function decrease(
        Storage storage s,
        address _account,
        uint128 _liquidity,
        uint256 _amount0Min,
        uint256 _amount1Min,
        uint256 _deadline
    )
        external
        returns (
            uint256 amount0,
            uint256 amount1,
            uint256 amount0Uniswap,
            uint256 amount1Uniswap
        )
    {
        if (_liquidity == 0) {
            return (0, 0, 0, 0);
        }

        // slither-disable-start reentrancy-benign,reentrancy-events,unused-return
        // aderyn-ignore-next-line
        (amount0Uniswap, amount1Uniswap) = UniswapV3Integration.decrease({
            s: s,
            _liquidity: _liquidity,
            _amount0Min: _amount0Min,
            _amount1Min: _amount1Min,
            _deadline: _deadline
        });
        //slither-disable-end reentrancy-benign,reentrancy-events,unused-return

        (amount0, amount1) = UniswapV3Integration.getAmountsFromLiquidity(
            s,
            _liquidity
        );

        s.liquidityOf[_account] -= _liquidity;
        emit IPoolPartyPosition.LiquidityRemoved(
            _account,
            s.positionKey.toId(),
            _liquidity,
            amount0,
            amount1
        );

        Liquidity.updateLiquidity(s);
    }

    function collect(
        Storage storage s,
        address _recipient,
        address _investor,
        uint128 _earned0,
        uint128 _earned1
    ) external returns (uint256 amount0, uint256 amount1) {
        if (_earned0 == 0 && _earned1 == 0) {
            return (0, 0);
        }

        s.earned0Of[_investor] = 0;
        s.earned1Of[_investor] = 0;

        //slither-disable-start reentrancy-events,reentrancy-no-eth
        // aderyn-ignore-next-line
        (amount0, amount1) = UniswapV3Integration.collect({
            s: s,
            _recipient: _recipient,
            _amount0Max: _earned0,
            _amount1Max: _earned1
        });
        //slither-disable-end reentrancy-events,reentrancy-no-eth
    }

    function closePosition(
        Storage storage s,
        address _recipient,
        uint256 _deadline
    )
        external
        returns (
            uint128 _operatorLiquidity,
            uint256 _operatorAmount0,
            uint256 _operatorAmount1,
            uint256 _operatorCollectedToken0,
            uint256 _operatorCollectedToken1
        )
    {
        PositionId posisionId = s.positionKey.toId();
        //slither-disable-next-line unused-return,reentrancy-no-eth
        (, , uint128 prevLiquidity, , ) = UniswapV3Integration
            .getPoolPositionInfo(s);

        (uint160 sqrtPriceX96Pool, , , , , , ) = IUniswapV3Pool(
            s.positionKey.pool
        ).slot0();

        s.sqrtPriceX96BeforeClose = sqrtPriceX96Pool;

        //slither-disable-start reentrancy-events,reentrancy-no-eth
        // aderyn-ignore-next-line
        (
            uint256 tokensDecreased0,
            uint256 tokensDecreased1
        ) = UniswapV3Integration.decrease({
                s: s,
                _liquidity: prevLiquidity,
                _amount0Min: 0,
                _amount1Min: 0,
                _deadline: _deadline
            });
        //slither-disable-end reentrancy-events,reentrancy-no-eth

        uint128 operatorCollectedToken0 = uint128(s.earned0Of[s.i_operator]);
        uint128 operatorCollectedToken1 = uint128(s.earned1Of[s.i_operator]);

        //slither-disable-start reentrancy-events,reentrancy-no-eth
        // aderyn-ignore-next-line
        UniswapV3Integration.collect({
            s: s,
            _recipient: _recipient,
            _amount0Max: type(uint128).max,
            _amount1Max: type(uint128).max
        });
        //slither-disable-end reentrancy-events,reentrancy-no-eth

        (uint256 rewardIndex0, uint256 rewardIndex1, , ) = Rewards
            ._calculateVirtualRewardIndexes(s);
        uint256 _rewardIndex0 = (s.rewardIndex0 + rewardIndex0);
        uint256 _rewardIndex1 = (s.rewardIndex1 + rewardIndex1);

        uint256 realTokensCollected0 = ((prevLiquidity * _rewardIndex0) / 1e20);
        uint256 realTokensCollected1 = ((prevLiquidity * _rewardIndex1) / 1e20);

        uint128 removedOpLiquidty = s.liquidityOf[s.i_operator];
        (_operatorAmount0, _operatorAmount1) = UniswapV3Integration
            .getAmountsFromLiquidity(s, removedOpLiquidty);

        s.liquidityBeforeClose = prevLiquidity;
        s.remainingLiquidityAfterClose = prevLiquidity - removedOpLiquidty;

        s.liquidityOf[s.i_operator] = 0;
        s.earned0Of[s.i_operator] = 0;
        s.earned1Of[s.i_operator] = 0;

        _closePoolPosition(s, posisionId);
        s.liquidity = 0;

        emit IPoolPartyPosition.LiquidityRemoved(
            s.i_operator,
            posisionId,
            removedOpLiquidty,
            _operatorAmount0,
            _operatorAmount1
        );

        emit IPoolPartyPosition.RewardsCollected(
            s.i_operator,
            posisionId,
            operatorCollectedToken0,
            operatorCollectedToken1
        );

        emit IPoolPartyPosition.AllRewardsCollected(
            posisionId,
            realTokensCollected0,
            realTokensCollected1
        );

        emit IPoolPartyPosition.PositionClosed(
            posisionId,
            address(_recipient),
            prevLiquidity,
            tokensDecreased0,
            tokensDecreased1
        );

        return (
            removedOpLiquidty,
            _operatorAmount0,
            _operatorAmount1,
            operatorCollectedToken0,
            operatorCollectedToken1
        );
    }

    function withdraw(
        Storage storage s,
        IPoolPartyPositionView _position,
        address _recipient,
        address _investor,
        uint256 _deadline
    )
        external
        returns (
            uint256 amount0,
            uint256 amount1,
            uint128 earned0,
            uint128 earned1
        )
    {
        earned0 = uint128(s.earned0Of[_investor]);
        earned1 = uint128(s.earned1Of[_investor]);

        //slither-disable-start unused-return,reentrancy-no-eth
        uint128 _liquidity = s.liquidityOf[_investor];

        (amount0, amount1) = UniswapV3Integration.getAmountsFromLiquidity(
            s,
            _liquidity
        );

        if (!_position.isClosed() && _liquidity > 0) {
            // aderyn-ignore-next-line
            (uint256 _amount0, uint256 _amount1) = UniswapV3Integration
                .decrease({
                    s: s,
                    _liquidity: _liquidity,
                    _amount0Min: 0,
                    _amount1Min: 0,
                    _deadline: _deadline
                });

            // aderyn-ignore-next-line
            UniswapV3Integration.collect({
                s: s,
                _recipient: _recipient,
                _amount0Max: earned0 + uint128(_amount0),
                _amount1Max: earned1 + uint128(_amount1)
            });
        } else {
            // aderyn-ignore-next-line
            UniswapV3Integration.collect({
                s: s,
                _recipient: _recipient,
                _amount0Max: earned0 + uint128(amount0),
                _amount1Max: earned1 + uint128(amount1)
            });
        }
        //slither-disable-end unused-return,reentrancy-no-eth

        s.liquidityOf[_investor] = 0;
        s.earned0Of[_investor] = 0;
        s.earned1Of[_investor] = 0;

        if (s.remainingLiquidityAfterClose > 0) {
            s.remainingLiquidityAfterClose -= _liquidity;
        }

        return (amount0, amount1, earned0, earned1);
    }

    function _closePoolPosition(Storage storage s, PositionId _id) private {
        s.isOpen[_id][s.tokenId] = false;
        delete s.isOpen[_id][s.tokenId];
    }
}
