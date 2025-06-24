// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {IAllowanceTransfer} from "@uniswap/permit2/src/interfaces/IAllowanceTransfer.sol";
import {PositionId} from "../types/PositionId.sol";
import {IPoolPartyPosition} from "./IPoolPartyPosition.sol";

interface IPoolPartyPositionManager {
    /// @notice Emitted when the manager is destroyed
    event Destroyed();

    /// @notice Sets the root for the operators whitelist
    function setRootForOperatorsWhitelist(bytes32 _root) external;

    /// @notice Sets the root for the investors whitelist
    function setRootForInvestorsWhitelist(bytes32 _root) external;

    /// @notice Sets the max investment for the pool party
    function setMaxInvestment(uint256 _maxInvestment) external;

    /// @notice Sets the pool party recipient
    function setPoolPartyRecipient(address _poolPartyRecipient) external;

    /// @notice Pauses the manager
    function pause() external;

    /// @notice Unpauses the manager
    function unpause() external;

    /// @notice Destroys the manager
    function destroy() external;

    /// @notice HiddenFields is a struct that contains the fields that can be hidden in the front end
    struct HiddenFields {
        bool showPriceRange;
        bool showTokenPair;
        bool showInOutRange;
    }

    struct FeatureSettings {
        /// @param The name of the pool
        string name;
        /// @param The description of the pool
        string description;
        /// @param The operator fee associated with the pool: between 1000 (10%) and 10000 (100%)
        uint24 operatorFee;
        /// @notice These are parameters for the front end to show/hide certain fields
        HiddenFields hiddenFields;
    }

    struct PositionData {
        PositionId positionId;
        address pool;
        address operator;
        address token0;
        address token1;
        uint256 totalSupply0;
        uint256 totalSupply1;
        uint256 tokenId;
        uint24 fee;
        int24 tickLower;
        int24 tickUpper;
        int8 inRange;
        bool closed;
        FeatureSettings featureSettings;
        uint256 totalInvestors;
        address uniswapV3Pool;
        uint160 sqrtPriceX96Pool;
    }

    struct InvestorPositionData {
        PositionId positionId;
        address pool;
        address token0;
        address token1;
        uint256 tokenId;
        uint256 amount0;
        uint256 amount1;
        uint256 rewards0;
        uint256 rewards1;
        uint24 fee;
        uint256 totalInvestors;
    }

    struct ConstructorParams {
        /// @param The address of the admin
        address admin;
        /// @param The address of the upgrader
        address upgrader;
        /// @param The address of the pauser
        address pauser;
        /// @param The address of the destroyer
        address destroyer;
        /// @param The address of the INonfungiblePositionManager
        address nonfungiblePositionManager;
        /// @param The address of the Uniswap V3 Factory
        address uniswapV3Factory;
        /// @param The address of the Uniswap V3 Swap Router
        address uniswapV3SwapRouter;
        /// @param The address of Permit2 contract
        address permit2;
        /// @param The address of the WETH9 token
        address WETH9;
        /// @param The address of the USDC token
        address usdc;
        /// @param The address of the poolParty recipient
        address poolPartyRecipient;
        /// @param The address of the UbitsPoolPositionFactory
        address poolPositionFactory;
        /// @param The root for the operators whitelist
        bytes32 rootForOperatorsWhitelist;
        /// @param The root for the investors whitelist
        bytes32 rootForInvestorsWhitelist;
    }

    struct CreatePositionParams {
        /// @param The proof associated with the operators whitelist
        bytes32[] proof;
        /// @notice Worth noting we expect the token0 and token1 to be in the correct order,
        /// as the pool will be created with token at postion 0 as 'token0' and token at position 1 as 'token1'
        /// @param The batch permit params necessary to add liquidity to a pool position using permit, encoded as `IAllowanceTransfer.PermitBatch` in calldata
        IAllowanceTransfer.PermitBatch permitBatch;
        /// @param signature The signature necessary to add liquidity to a pool position using permit
        bytes signature;
        /// @param The fee associated with the pool: 100 (0,01%),500 (0,05%), 3000 (0,3%), or 10000 (1%)
        uint24 fee;
        /// @param tickLower The lower end of the tick range for the position
        int24 tickLower;
        /// @param tickUpper The higher end of the tick range for the position
        int24 tickUpper;
        /// @notice Must be calculated in the client side to adjust for slippage tolerance.
        /// @param amount0Min The minimum amount of token0 to spend, which serves as a slippage check
        uint256 amount0Min;
        /// @notice Must be calculated in the client side to adjust for slippage tolerance.
        /// @param amount1Min The minimum amount of token1 to spend, which serves as a slippage check
        uint256 amount1Min;
        /// @param deadline The time by which the transaction must be included to effect the change
        uint256 deadline;
        /// @notice Sets the initial price for the pool
        /// @dev Price is represented as a sqrt(amountToken1/amountToken0) Q64.96 value
        /// @param sqrtPriceX96 the initial sqrt price of the pool as a Q64.96
        uint160 sqrtPriceX96;
        /// @param The params necessary to create a pool position, encoded as `FeatureSettings` in calldata
        FeatureSettings featureSettings;
    }

    /// @notice Creates a new pool position
    /// @param _params The params necessary to create a pool position, encoded as `CreatePositionParams` in calldata
    /// @return positionId The id that represents the position
    /// @dev revert if the position already exists
    function createPosition(
        CreatePositionParams calldata _params
    ) external payable returns (PositionId positionId);

    struct AddLiquidityParams {
        /// @param The proof associated with the investors whitelist
        bytes32[] proof;
        /// @param The id of the position for a specific pool
        PositionId positionId;
        /// @param deadline The time by which the transaction must be included to effect the change
        uint256 deadline;
        /// @param swap The params necessary to swap to USDC, encoded as `SwapParams` in calldata
        IPoolPartyPosition.SwapParams swap;
        /// @param permit The permit params necessary to add liquidity to a pool position using permit, encoded as `IAllowanceTransfer.PermitSingle` in calldata
        IAllowanceTransfer.PermitSingle permit;
        /// @param signature The signature necessary to add liquidity to a pool position using permit
        bytes signature;
        /// @param ignoreSlippage The flag to ignore slippage tolerance
        bool ignoreSlippage;
    }

    /// @notice Adds the amount of liquidity in a position, with tokens paid by the `msg.sender`
    /// @param _params The params necessary to add liquidity to a pool position, encoded as `AddLiquidityParams` in calldata
    /// @return liquidity The liquidity amount as a result of the increase
    /// @return amount0 The amount of token0 to acheive resulting liquidity
    /// @return amount1 The amount of token1 to acheive resulting liquidity
    function addLiquidity(
        AddLiquidityParams calldata _params
    ) external returns (uint128 liquidity, uint256 amount0, uint256 amount1);

    struct RemoveLiquidityParams {
        /// @param The id of the position for a specific pool
        PositionId positionId;
        /// @param percentage The percentage of liquidity to be removed
        /// @dev The percentage is represented as 1e15 (1%) - 100e15 (100%)
        uint256 percentage;
        /// @notice Must be calculated in the client side to adjust for slippage tolerance.
        /// @param amount0Min The minimum amount of token0 to spend, which serves as a slippage check
        uint256 amount0Min;
        /// @notice Must be calculated in the client side to adjust for slippage tolerance.
        /// @param amount1Min The minimum amount of token1 to spend, which serves as a slippage check
        uint256 amount1Min;
        /// @param deadline The time by which the transaction must be included to effect the change
        uint256 deadline;
        /// @param swap The params necessary to swap to USDC, encoded as `SwapParams` in calldata
        IPoolPartyPosition.SwapParams swap;
    }

    /// @notice Removes the amount of liquidity from a position, with tokens sent to the `investor`
    /// @param _params The params necessary to remove liquidity from a pool position, encoded as `RemoveLiquidityParams` in calldata
    /// @return liquidity The liquidity amount as a result of the remove
    /// @return amount0 The amount of token0 to acheive resulting liquidity
    /// @return amount1 The amount of token1 to acheive resulting liquidity
    function removeLiquidity(
        RemoveLiquidityParams calldata _params
    ) external returns (uint128 liquidity, uint256 amount0, uint256 amount1);

    struct CollectParams {
        /// @param The id of the position for a specific pool
        PositionId positionId;
        /// @param deadline The time by which the transaction must be included to effect the change
        uint256 deadline;
        /// @param swap The params necessary to swap to USDC, encoded as `SwapParams` in calldata
        IPoolPartyPosition.SwapParams swap;
    }

    /// @notice Collects up to a maximum amount of rewards owed to a specific position to the `recipient`
    /// @param _params The params necessary to collect rewards from a pool position, encoded as `CollectParams` in calldata
    /// @return amount0 The amount of token0 fees collected
    /// @return amount1 The amount of token1 fees collected
    function collectRewards(
        CollectParams calldata _params
    ) external returns (uint256 amount0, uint256 amount1);

    function changeRange() external;

    struct ClosePoolParams {
        /// @param The id of the position for a specific pool
        PositionId positionId;
        /// @param deadline The time by which the transaction must be included to effect the change
        uint256 deadline;
    }

    /// @notice Closes the pool and returns the liquidity to the `operator`
    /// @param _params The params necessary to close a pool position, encoded as `ClosePoolParams` in calldata
    function closePool(
        ClosePoolParams calldata _params
    ) external returns (uint128, uint256, uint256);

    struct WithdrawParams {
        /// @param The id of the position for a specific pool
        PositionId positionId;
        /// @param deadline The time by which the transaction must be included to effect the change
        uint256 deadline;
        /// @param swap The params necessary to swap to USDC, encoded as `SwapParams` in calldata
        IPoolPartyPosition.SwapParams swap;
    }

    /// @notice Withdraws all tokens and collected fees owed to a specific position to the `investor`
    /// @param _params The params necessary to withdraw from a pool position, encoded as `WithdrawParams` in calldata
    /// @return The amount of token0
    /// @return The amount of token1
    /// @return The net amount of token0 fees collected
    /// @return The net amount of token1 fees collected
    /// @dev event Withdrawn is emitted
    function withdraw(
        WithdrawParams calldata _params
    ) external returns (uint256, uint256, uint256, uint256);

    /// @notice Returns the positions' address for a specific operator
    /// @param _operator The address of the operator
    /// @return A lsit of positions' address for a specific operator
    function operatorPositions(
        address _operator
    ) external view returns (address[] memory);

    /// @notice Returns the position's address for a specific operator
    /// @param _positionId The id of the position
    /// @return The position's address for a specific operator
    function operatorPosition(
        PositionId _positionId
    ) external view returns (address);

    /// @notice Returns the positions' address for a specific investor
    /// @param _investor The address of the investor
    /// @return A lsit of positions' address for a specific investor
    function investorPositions(
        address _investor
    ) external view returns (address[] memory);

    /// @notice Returns the position's address for a specific investor
    /// @param _investor The address of the investor
    /// @param _positionId The id of the position
    /// @return The position's address for a specific investor
    function investorPosition(
        address _investor,
        PositionId _positionId
    ) external view returns (address);

    /// @notice Returns all the positions' address
    function allPositions() external view returns (address[] memory);

    // @notice Returns the list of positions' data for a specific account
    function listOfPositionDataBy(
        address _account,
        address[] calldata _positions
    ) external view returns (InvestorPositionData[] memory);

    // @notice Returns the position's data for a specific position
    function positionData(
        address _position
    ) external view returns (PositionData memory);

    /// @notice Returns if the manager is destroyed
    function destroyed() external view returns (bool);
}
