// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {LiquidityAmounts} from "../../src/library/uniswap/LiquidityAmounts.sol";
import {INonfungiblePositionManager} from "../../src/interfaces/INonfungiblePositionManager.sol";
import {IPoolPartyPosition} from "../../src/interfaces/IPoolPartyPosition.sol";
import {TickMath} from "../../src/library/uniswap/TickMath.sol";
import {ERC20Mock} from "./ERC20Mock.sol";
import {Test, console} from "forge-std/Test.sol";

uint160 constant CURRENT_SQRT_PRICE = 1553792102639747150997811827310592;

contract NonfungiblePositionManagerMock is Test {
    uint256 private constant MULTIPLIER0 = 1e6;
    uint256 private constant MULTIPLIER1 = 1e18;
    uint128 s_liquidity = 3288341567141674;

    IPoolPartyPosition poolPosition;
    ERC20 token0;
    ERC20 token1;
    int24 tickLower;
    int24 tickUpper;

    constructor(
        ERC20 _token0,
        ERC20 _token1,
        int24 _tickLower,
        int24 _tickUpper
    ) {
        token0 = _token0;
        token1 = _token1;
        tickLower = _tickLower;
        tickUpper = _tickUpper;
    }

    function setPoolPosition(IPoolPartyPosition _poolPosition) external {
        poolPosition = _poolPosition;
    }

    function positions(
        uint256
    )
        external
        view
        returns (
            uint96 nonce,
            address operator,
            address,
            address,
            uint24 fee,
            int24,
            int24,
            uint128 liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        )
    {
        if (address(poolPosition) != address(0) && poolPosition.isClosed()) {
            return (
                0,
                address(0),
                address(0),
                address(0),
                10000, // fee
                tickLower,
                tickUpper,
                0, // liquidity
                0,
                0,
                0, // tokensOwed0
                0 // tokensOwed1
            );
        }
        return (
            0,
            address(0),
            address(0),
            address(0),
            10000, // fee
            tickLower,
            tickUpper,
            s_liquidity, // liquidity
            0,
            0,
            10 * uint128(MULTIPLIER0), // tokensOwed0
            10 * uint128(MULTIPLIER1) // tokensOwed1
        );
    }

    function mint(
        INonfungiblePositionManager.MintParams calldata params
    )
        external
        payable
        returns (
            uint256 tokenId,
            uint128 liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        token0.transferFrom(msg.sender, address(this), params.amount0Desired);
        token1.transferFrom(msg.sender, address(this), params.amount1Desired);

        uint128 mintLiquidity = getLiquidityForAmounts(
            params.amount0Desired,
            params.amount1Desired
        );

        s_liquidity = mintLiquidity;

        return (1, s_liquidity, params.amount0Desired, params.amount1Desired);
    }

    function increaseLiquidity(
        INonfungiblePositionManager.IncreaseLiquidityParams calldata params
    )
        external
        payable
        returns (uint128 liquidity, uint256 amount0, uint256 amount1)
    {
        liquidity = getLiquidityForAmounts(
            params.amount0Desired,
            params.amount1Desired
        );
        s_liquidity += liquidity;
        (amount0, amount1) = getAmountsForLiquidity(liquidity);
        token0.transferFrom(msg.sender, address(this), amount0);
        token1.transferFrom(msg.sender, address(this), amount1);
    }

    function decreaseLiquidity(
        INonfungiblePositionManager.DecreaseLiquidityParams calldata params
    ) external payable returns (uint256 amount0, uint256 amount1) {
        s_liquidity -= params.liquidity;
        (amount0, amount1) = getAmountsForLiquidity(params.liquidity);
        token0.transfer(msg.sender, amount0);
        token1.transfer(msg.sender, amount1);
        return (amount0, amount1);
    }

    function collect(
        INonfungiblePositionManager.CollectParams calldata params
    ) external payable returns (uint256 amount0, uint256 amount1) {
        amount0 = params.amount0Max;
        amount1 = params.amount1Max;
        if (amount0 == type(uint256).max) {
            amount0 = 100e6;
        }
        if (amount1 == type(uint256).max) {
            amount1 = 150e18;
        }
        ERC20Mock(address(token0)).mint2(msg.sender, amount0);
        ERC20Mock(address(token1)).mint2(msg.sender, amount1);
        return (amount0, amount1);
    }

    function numDigits(uint256 number) internal pure returns (uint8) {
        uint8 digits = 0;
        while (number != 0) {
            number /= 10;
            digits++;
        }
        return digits;
    }

    function getLiquidityForAmounts(
        uint256 amount0,
        uint256 amount1
    ) public view returns (uint128) {
        uint160 sqrtPriceX96Lower = TickMath.getSqrtRatioAtTick(tickLower);
        uint160 sqrtPriceX96Upper = TickMath.getSqrtRatioAtTick(tickUpper);

        uint128 liquidity = LiquidityAmounts.getLiquidityForAmounts(
            CURRENT_SQRT_PRICE,
            sqrtPriceX96Lower,
            sqrtPriceX96Upper,
            amount0,
            amount1
        );
        return liquidity;
    }

    function getAmountsForLiquidity(
        uint128 liquidity
    ) public view returns (uint256 amount0, uint256 amount1) {
        uint160 sqrtPriceX96Lower = TickMath.getSqrtRatioAtTick(tickLower);
        uint160 sqrtPriceX96Upper = TickMath.getSqrtRatioAtTick(tickUpper);

        (amount0, amount1) = LiquidityAmounts.getAmountsForLiquidity(
            CURRENT_SQRT_PRICE,
            sqrtPriceX96Lower,
            sqrtPriceX96Upper,
            liquidity
        );
    }
}
