// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {PositionKey} from "../types/PositionKey.sol";
import "./uniswap/TickMath.sol";
import "./uniswap/FullMath.sol";
import "./uniswap/FixedPoint96.sol";

library RatioMath {
    uint256 private constant MULTIPLIER = 1e3;

    /**
     * @notice Calculates the ratio between the current price and the price range
     * @param positionKey The  position key
     * @param sqrtPriceX96Current  The current price
     * @param inverted  If the token0 and token1 are inverted
     * @return _ratio The ratio between the current price and the price range
     * @dev The formula is: r = 1 / ((((sqrt(priceLow * priceHigh) - sqrt(priceHigh * priceCurrent)) / (priceCurrent - sqrt(priceHigh * priceCurrent))) + 1))
     * We return the result multiplied by 1e22 to have 4 decimals of precision in the result and
     * we should divide by 10_000 to get the actual ratio. Example: 5 is 0,0005
     */
    function ratio(
        PositionKey memory positionKey,
        uint160 sqrtPriceX96Current,
        bool inverted
    ) public view returns (uint256 _ratio) {
        address token0 = positionKey.token0;
        address token1 = positionKey.token1;
        int24 tickLow = positionKey.tickLower;
        int24 tickHigh = positionKey.tickUpper;

        uint256 sqrtPriceX96Low = TickMath.getSqrtRatioAtTick(tickLow);
        uint256 sqrtPriceX96High = TickMath.getSqrtRatioAtTick(tickHigh);

        int16 decimalsDiff = int16(
            int8(ERC20(token0).decimals()) - int8(ERC20(token1).decimals())
        );
        uint256 decimals = decimalsDiff < 0
            ? uint256(10 ** uint16(-decimalsDiff))
            : uint256(10 ** uint16(decimalsDiff));

        uint256 priceLow = ((FullMath.mulDiv(
            sqrtPriceX96Low,
            MULTIPLIER,
            FixedPoint96.Q96
        ) ** 2) / decimals) / MULTIPLIER;

        if (priceLow == 0) {
            priceLow =
                ((FullMath.mulDiv(
                    sqrtPriceX96Low,
                    MULTIPLIER,
                    FixedPoint96.Q96
                ) ** 2) * decimals) /
                MULTIPLIER;
        }

        uint256 priceHigh = ((FullMath.mulDiv(
            sqrtPriceX96High,
            MULTIPLIER,
            FixedPoint96.Q96
        ) ** 2) / decimals) / MULTIPLIER;

        if (priceHigh == 0) {
            priceHigh =
                ((FullMath.mulDiv(
                    sqrtPriceX96High,
                    MULTIPLIER,
                    FixedPoint96.Q96
                ) ** 2) * decimals) /
                MULTIPLIER;
        }

        uint256 priceCurrent = ((FullMath.mulDiv(
            sqrtPriceX96Current,
            MULTIPLIER,
            FixedPoint96.Q96
        ) ** 2) / decimals) / MULTIPLIER;

        if (priceCurrent == 0) {
            priceCurrent =
                ((FullMath.mulDiv(
                    sqrtPriceX96Current,
                    MULTIPLIER,
                    FixedPoint96.Q96
                ) ** 2) * decimals) /
                MULTIPLIER;
        }

        if (priceCurrent < priceLow) {
            return inverted ? 0 : 10_000;
        } else if (priceCurrent > priceHigh) {
            return inverted ? 10_000 : 0;
        }

        int256 sqrtPriceHighTimesCurrent = int256(
            _sqrt(priceHigh * priceCurrent)
        );

        int256 A = int256(_sqrt(priceLow * priceHigh)) -
            sqrtPriceHighTimesCurrent;
        if (A < 0) {
            A = -A;
        }

        int256 B = (int256(priceCurrent) - sqrtPriceHighTimesCurrent);
        if (B < 0) {
            B = -B;
        }

        int256 C = ((A * int256(MULTIPLIER)) / B) + (1 * int256(MULTIPLIER));
        // 1e22 to have 4 decimals of precision in the result
        _ratio = (1e22 / uint(C));
        if (inverted) {
            _ratio = 10_000 - _ratio;
        }
    }

    function _ceil(uint a, uint m) public pure returns (uint r) {
        return ((a + m - 1) / m) * m;
    }

    /// @notice Calculates the square root of x, rounding down.
    /// @dev Uses the Babylonian method https://en.wikipedia.org/wiki/Methods_of_computing_square_roots#Babylonian_method.
    /// @param x The uint256 number for which to calculate the square root.
    /// @return result The result as an uint256.
    function _sqrt(uint256 x) public pure returns (uint256 result) {
        if (x == 0) {
            return 0;
        }

        // Calculate the square root of the perfect square of a power of two that is the closest to x.
        uint256 xAux = uint256(x);
        result = 1;
        if (xAux >= 0x100000000000000000000000000000000) {
            xAux >>= 128;
            result <<= 64;
        }
        if (xAux >= 0x10000000000000000) {
            xAux >>= 64;
            result <<= 32;
        }
        if (xAux >= 0x100000000) {
            xAux >>= 32;
            result <<= 16;
        }
        if (xAux >= 0x10000) {
            xAux >>= 16;
            result <<= 8;
        }
        if (xAux >= 0x100) {
            xAux >>= 8;
            result <<= 4;
        }
        if (xAux >= 0x10) {
            xAux >>= 4;
            result <<= 2;
        }
        if (xAux >= 0x8) {
            result <<= 1;
        }

        // The operations can never overflow because the result is max 2^127 when it enters this block.
        unchecked {
            result = (result + x / result) >> 1;
            result = (result + x / result) >> 1;
            result = (result + x / result) >> 1;
            result = (result + x / result) >> 1;
            result = (result + x / result) >> 1;
            result = (result + x / result) >> 1;
            result = (result + x / result) >> 1; // Seven iterations should be enough
            uint256 roundedDownResult = x / result;
            return result >= roundedDownResult ? roundedDownResult : result;
        }
    }
}
