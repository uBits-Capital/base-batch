// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {TransferHelper} from "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IV3SwapRouter} from "../interfaces/IV3SwapRouter.sol";
import {ISwapRouter} from "../interfaces/ISwapRouter.sol";
import {INonfungiblePositionManager} from "../interfaces/INonfungiblePositionManager.sol";
import {Storage} from "../storage/PoolPartyPositionStorage.sol";
import {LiquidityAmounts} from "./uniswap/LiquidityAmounts.sol";
import {TickMath} from "./uniswap/TickMath.sol";
import {PositionValue} from "./uniswap/PositionValue.sol";
import {PositionKey} from "../types/PositionKey.sol";
import {PositionId, PositionIdLib} from "../types/PositionId.sol";

library UniswapV3Integration {
    using PositionIdLib for PositionKey;

    function mint(
        Storage storage s,
        address _recipient,
        uint256 _amount0Min,
        uint256 _amount1Min,
        uint256 _amount0Desired,
        uint256 _amount1Desired,
        uint256 _deadline
    ) public returns (uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1) {
        address token0 = s.positionKey.token0;
        address token1 = s.positionKey.token1;
        uint24 fee = s.positionKey.fee;
        int24 tickLower = s.positionKey.tickLower;
        int24 tickUpper = s.positionKey.tickUpper;
        //slither-disable-next-line reentrancy-no-eth,locked-ether
        (tokenId, liquidity, amount0, amount1) = s.i_nonfungiblePositionManager.mint(
            INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: fee,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: _amount0Desired,
                amount1Desired: _amount1Desired,
                amount0Min: _amount0Min,
                amount1Min: _amount1Min,
                recipient: _recipient,
                deadline: _deadline
            })
        );
    }

    function increase(
        Storage storage s,
        uint256 _amount0Min,
        uint256 _amount1Min,
        uint256 _amount0Desired,
        uint256 _amount1Desired,
        uint256 _deadline
    ) public returns (uint128 liquidity, uint256 amount0, uint256 amount1) {
        //slither-disable-next-line reentrancy-no-eth,locked-ether
        (liquidity, amount0, amount1) = s.i_nonfungiblePositionManager.increaseLiquidity(
            INonfungiblePositionManager.IncreaseLiquidityParams({
                tokenId: s.tokenId,
                amount0Desired: _amount0Desired,
                amount1Desired: _amount1Desired,
                amount0Min: _amount0Min,
                amount1Min: _amount1Min,
                deadline: _deadline
            })
        );
    }

    function decrease(
        Storage storage s,
        uint128 _liquidity,
        uint256 _amount0Min,
        uint256 _amount1Min,
        uint256 _deadline
    ) public returns (uint256 amount0, uint256 amount1) {
        if (_liquidity == 0) {
            return (0, 0);
        }
        //slither-disable-next-line reentrancy-no-eth,locked-ether
        (amount0, amount1) = s.i_nonfungiblePositionManager.decreaseLiquidity(
            INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: s.tokenId,
                liquidity: _liquidity,
                amount0Min: _amount0Min,
                amount1Min: _amount1Min,
                deadline: _deadline
            })
        );
    }

    function collect(Storage storage s, address _recipient, uint128 _amount0Max, uint128 _amount1Max)
        public
        returns (uint256 amount0, uint256 amount1)
    {
        if (_amount0Max == 0 && _amount1Max == 0) {
            return (0, 0);
        }

        //slither-disable-next-line reentrancy-no-eth,locked-ether
        (amount0, amount1) = s.i_nonfungiblePositionManager.collect(
            INonfungiblePositionManager.CollectParams({
                tokenId: s.tokenId,
                recipient: _recipient,
                amount0Max: _amount0Max,
                amount1Max: _amount1Max
            })
        );
    }

    function exactInputSingleSwap(
        IV3SwapRouter _swapRouter,
        address _tokenIn,
        address _tokenOut,
        uint256 _amountIn,
        address _recipient,
        uint24 _fee,
        uint256 _amountOutMinimum
    ) public returns (uint256 amountOut) {
        require(ERC20(_tokenIn).approve(address(_swapRouter), _amountIn), "approve failed");

        try _swapRouter.exactInputSingle(
            IV3SwapRouter.ExactInputSingleParams({
                tokenIn: _tokenIn,
                tokenOut: _tokenOut,
                fee: _fee,
                recipient: _recipient,
                amountIn: _amountIn,
                amountOutMinimum: _amountOutMinimum,
                sqrtPriceLimitX96: 0
            })
        ) returns (uint256 _amountOut) {
            return _amountOut;
        } catch Error(string memory reason) {
            string memory message = string.concat("swap failed: ", reason);
            revert(message);
        } catch (bytes memory) {
            revert("swap failed");
        }
    }

    function exactInputMultihopSwap(
        IV3SwapRouter _swapRouter,
        address _tokenIn,
        bytes memory _path,
        uint256 _amountIn,
        address _recipient,
        uint256 _amountOutMinimum
    ) public returns (uint256 amountOut) {
        TransferHelper.safeApprove(_tokenIn, address(_swapRouter), _amountIn);
        IV3SwapRouter.ExactInputParams memory params = IV3SwapRouter.ExactInputParams({
            path: _path,
            recipient: _recipient,
            amountIn: _amountIn,
            amountOutMinimum: _amountOutMinimum
        });
        try _swapRouter.exactInput(params) returns (uint256 _amountOut) {
            return _amountOut;
        } catch Error(string memory reason) {
            string memory message = string.concat("swap failed: ", reason);
            revert(message);
        } catch (bytes memory) {
            revert("swap failed");
        }
    }

    function getPoolPositionInfo(Storage storage s)
        public
        view
        returns (uint256 amount0, uint256 amount1, uint128 liquidity, uint256 tokensOwed0, uint256 tokensOwed1)
    {
        //slither-disable-next-line unused-return,reentrancy-no-eth
        (,,,,,,, liquidity,,,,) = s.i_nonfungiblePositionManager.positions(s.tokenId);

        // if liquidity is 0, it means the position has been closed. Then we already collected the all fees
        if (liquidity == 0) {
            return (0, 0, 0, 0, 0);
        }

        (tokensOwed0, tokensOwed1) = PositionValue.fees(s.i_nonfungiblePositionManager, s.tokenId);

        (amount0, amount1) = getAmountsFromLiquidity(s, liquidity);
    }

    function getAmountsFromLiquidity(Storage storage s, uint128 _liquidity)
        public
        view
        returns (uint256 amount0, uint256 amount1)
    {
        if (_liquidity == 0) {
            return (0, 0);
        }

        //slither-disable-next-line unused-return,reentrancy-no-eth
        (uint160 sqrtPriceX96Pool,,,,,,) = IUniswapV3Pool(s.positionKey.pool).slot0();

        if (!s.isOpen[s.positionKey.toId()][s.tokenId] && s.sqrtPriceX96BeforeClose > 0) {
            sqrtPriceX96Pool = s.sqrtPriceX96BeforeClose;
        }

        //slither-disable-next-line unused-return
        (,,,,, int24 tickLower, int24 tickUpper,,,,,) = s.i_nonfungiblePositionManager.positions(s.tokenId);
        uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower);
        uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper);
        (amount0, amount1) =
            LiquidityAmounts.getAmountsForLiquidity(sqrtPriceX96Pool, sqrtRatioAX96, sqrtRatioBX96, _liquidity);
    }

    function getLiquidityFromAmounts(Storage storage s, uint256 amount0, uint256 amount1)
        public
        view
        returns (uint128 liquidity0, uint128 liquidity1)
    {
        //slither-disable-next-line unused-return,reentrancy-no-eth
        (uint160 sqrtRatioX96,,,,,,) = IUniswapV3Pool(s.positionKey.pool).slot0();

        //slither-disable-next-line unused-return
        (,,,,, int24 tickLower, int24 tickUpper,,,,,) = s.i_nonfungiblePositionManager.positions(s.tokenId);
        uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower);
        uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper);

        if (sqrtRatioAX96 > sqrtRatioBX96) {
            (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioAX96, sqrtRatioBX96);
        }

        if (sqrtRatioX96 <= sqrtRatioAX96) {
            liquidity0 = LiquidityAmounts.getLiquidityForAmount0(sqrtRatioAX96, sqrtRatioBX96, amount0);
        } else if (sqrtRatioX96 < sqrtRatioBX96) {
            liquidity0 = LiquidityAmounts.getLiquidityForAmount0(sqrtRatioBX96, sqrtRatioX96, amount0);
            liquidity1 = LiquidityAmounts.getLiquidityForAmount1(sqrtRatioX96, sqrtRatioAX96, amount1);
        } else {
            liquidity1 = LiquidityAmounts.getLiquidityForAmount1(sqrtRatioBX96, sqrtRatioAX96, amount1);
        }
    }
}
