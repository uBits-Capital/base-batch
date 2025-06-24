// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {Core} from "../library/Core.sol";
import {Rewards} from "../library/Rewards.sol";
import {Liquidity} from "../library/Liquidity.sol";
import "../storage/PoolPartyPositionStorage.sol";

abstract contract View is PoolPartyPositionStorage {
    // slither-disable-start reentrancy-no-eth
    using PositionIdLib for PositionKey;

    /// @inheritdoc IPoolPartyPositionView
    function calculateRewards0Earned(
        address _account
    ) external view returns (uint256) {
        return Rewards._calculateVirtualRewards0(s, _account);
    }

    /// @inheritdoc IPoolPartyPositionView
    function calculateRewards1Earned(
        address _account
    ) external view returns (uint256) {
        return Rewards._calculateVirtualRewards1(s, _account);
    }

    /// @inheritdoc IPoolPartyPositionView
    function liquidityOf(address _account) external view returns (uint256) {
        return s.liquidityOf[_account];
    }

    /// @inheritdoc IPoolPartyPositionView
    function isClosed() external view returns (bool) {
        return _isClosed(s.positionKey.toId());
    }

    /// @inheritdoc IPoolPartyPositionView
    function liquidity() external view returns (uint128) {
        //slither-disable-next-line unused-return
        (, , uint128 _liquidity, , ) = UniswapV3Integration.getPoolPositionInfo(
            s
        );
        return _liquidity;
    }

    function remainingLiquidityAfterClose() external view returns (uint128) {
        return s.remainingLiquidityAfterClose;
    }

    /// @inheritdoc IPoolPartyPositionView
    function totalSupply0() external view returns (uint256) {
        //slither-disable-next-line unused-return
        (uint256 amount0, ) = UniswapV3Integration.getAmountsFromLiquidity(
            s,
            uint128(s.liquidity)
        );
        return amount0;
    }

    /// @inheritdoc IPoolPartyPositionView
    function totalSupply1() external view returns (uint256) {
        //slither-disable-next-line unused-return
        (, uint256 amount1) = UniswapV3Integration.getAmountsFromLiquidity(
            s,
            uint128(s.liquidity)
        );
        return amount1;
    }

    /// @inheritdoc IPoolPartyPositionView
    function balance0Of(address _account) external view returns (uint256) {
        //slither-disable-next-line unused-return
        (uint256 amount0, ) = UniswapV3Integration.getAmountsFromLiquidity(
            s,
            s.liquidityOf[_account]
        );
        return amount0;
    }

    /// @inheritdoc IPoolPartyPositionView
    function balance1Of(address _account) external view returns (uint256) {
        //slither-disable-next-line unused-return
        (, uint256 amount1) = UniswapV3Integration.getAmountsFromLiquidity(
            s,
            s.liquidityOf[_account]
        );
        return amount1;
    }

    /// @inheritdoc IPoolPartyPositionView
    function key() external view returns (PositionKey memory _positionKey) {
        return s.positionKey;
    }

    /// @inheritdoc IPoolPartyPositionView
    function tokenId() external view returns (uint256) {
        return s.tokenId;
    }

    /// @inheritdoc IPoolPartyPositionView
    function nonfungiblePositionManager()
        external
        view
        returns (INonfungiblePositionManager)
    {
        return INonfungiblePositionManager(s.i_nonfungiblePositionManager);
    }

    /// @inheritdoc IPoolPartyPositionView
    function swapRouter() external view returns (IV3SwapRouter) {
        return s.i_uniswapV3SwapRouter;
    }

    /// @inheritdoc IPoolPartyPositionView
    function pool() external view returns (address) {
        return s.positionKey.pool;
    }

    /// @inheritdoc IPoolPartyPositionView
    function usdc() external view returns (address) {
        return s.i_usdc;
    }

    /// @inheritdoc IPoolPartyPositionView
    function poolPartyRecipient() external view returns (address) {
        return s.i_poolPartyRecipient;
    }

    /// @inheritdoc IPoolPartyPositionView
    function poolPartyFee() external view returns (uint24) {
        return s.i_poolPartyFee;
    }

    /// @inheritdoc IPoolPartyPositionView
    function inRange() external view returns (int8) {
        //slither-disable-next-line unused-return
        (, int24 tick, , , , , ) = IUniswapV3Pool(s.positionKey.pool).slot0();
        if (s.positionKey.tickUpper < tick) {
            return 1;
        } else if (s.positionKey.tickLower > tick) {
            return -1;
        } else {
            return 0;
        }
    }

    function WETH9() external view returns (address) {
        return s.i_WETH9;
    }

    function _isClosed(PositionId _id) internal view returns (bool) {
        return !s.isOpen[_id][s.tokenId];
    }
}
