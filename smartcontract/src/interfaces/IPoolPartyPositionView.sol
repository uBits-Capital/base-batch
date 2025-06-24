// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {IV3SwapRouter} from "./IV3SwapRouter.sol";
import {INonfungiblePositionManager} from "./INonfungiblePositionManager.sol";
import {PositionKey} from "../types/PositionKey.sol";
import {PositionId} from "../types/PositionId.sol";

interface IPoolPartyPositionView {
    struct RefundVault {
        uint256 amount0;
        uint256 amount1;
    }

    /// @notice Returns the amount of rewards earned for token0 by a specific position for a specific account
    /// @param _account The account for which the rewards are calculated
    /// @return The amount of rewards earned by the account for token0
    function calculateRewards0Earned(
        address _account
    ) external view returns (uint256);

    /// @notice Returns the amount of rewards earned for token1 by a specific position for a specific account
    /// @param _account The account for which the rewards are calculated
    /// @return The amount of rewards earned by the account for token1
    function calculateRewards1Earned(
        address _account
    ) external view returns (uint256);

    /// @notice Returns the amount of liquidity in a specific position for a specific account
    /// @param _account The account for which the liquidity is calculated
    /// @return liquidity The amount of liquidity in the position for the account
    function liquidityOf(
        address _account
    ) external view returns (uint256 liquidity);

    /// @notice Returns if a specific position is closed
    function isClosed() external view returns (bool);

    /// @notice Returns the total liquidity in the position
    function liquidity() external view returns (uint128);

    /// @notice Returns the total remaining liquidity after close the position
    function remainingLiquidityAfterClose() external view returns (uint128);

    /// @notice Returns the total supply of token0
    function totalSupply0() external view returns (uint256);

    /// @notice Returns the total supply of token1
    function totalSupply1() external view returns (uint256);

    /// @notice Returns the balance of token0 for a specific account
    function balance0Of(address _account) external view returns (uint256);

    /// @notice Returns the balance of token1 for a specific account
    function balance1Of(address _account) external view returns (uint256);

    /// @notice Returns the position key
    function key() external view returns (PositionKey memory _positionKey);

    /// @notice Returns the token id
    function tokenId() external view returns (uint256);

    /// @notice Returns the nonfungible position manager
    function nonfungiblePositionManager()
        external
        view
        returns (INonfungiblePositionManager);

    /// @notice Returns the swap router
    function swapRouter() external view returns (IV3SwapRouter);

    /// @notice Returns the pool address of the position
    function pool() external view returns (address);

    /// @notice Returns the USDC token
    function usdc() external view returns (address);

    /// @notice Returns the PoolParty recipient
    function poolPartyRecipient() external view returns (address);

    /// @notice Returns the PoolParty fee
    function poolPartyFee() external view returns (uint24);

    /// @notice This function is used to check if the current tick is within the tick range of the pool position
    /// @return 0 if the current tick is within the tick range,
    //  1 if the current tick is above the tick range, -1 if the current tick is below the tick range.
    // @dev if the current tick is above the tick range (1), position is 100% token1,
    // if the current tick is below the tick range (-1), position is 100% token0
    function inRange() external view returns (int8);

    function WETH9() external view returns (address);
}
