// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {RatioMath} from "./RatioMath.sol";
import {UniswapV3Integration} from "./UniswapV3Integration.sol";
import {IWETH9} from "../interfaces/IWETH9.sol";
import "../interfaces/IPoolPartyPosition.sol";

uint16 constant SWAP_FEE = 9975; // 0.25% fee
uint24 constant FEE_DIVISOR = 10_000;

library PayMaster {
    using SafeERC20 for ERC20;
    using PositionIdLib for PositionKey;

    function splitCollectedFees(
        IPoolPartyPositionView _position,
        address _recipient,
        uint256 _amountToken0,
        uint256 _amountToken1
    ) public returns (uint256 recipientAmount0, uint256 recipientAmount1) {
        if (_amountToken0 == 0 && _amountToken1 == 0) {
            return (0, 0);
        }
        PositionKey memory positionKey = _position.key();
        address operator = positionKey.operator;
        uint24 operatorFee = positionKey.operatorFee;
        uint24 poolPartyFee = _position.poolPartyFee();
        address poolPartyRecipient = _position.poolPartyRecipient();
        address token0 = positionKey.token0;
        address token1 = positionKey.token1;

        uint256 operatorAmount0 = ((_amountToken0 * operatorFee) / FEE_DIVISOR);
        uint256 operatorAmount1 = ((_amountToken1 * operatorFee) / FEE_DIVISOR);
        //slither-disable-next-line divide-before-multiply
        uint256 poolPartyAmount0 = ((operatorAmount0 * poolPartyFee) /
            FEE_DIVISOR);
        //slither-disable-next-line divide-before-multiply
        uint256 poolPartyAmount1 = ((operatorAmount1 * poolPartyFee) /
            FEE_DIVISOR);

        recipientAmount0 = _amountToken0 - operatorAmount0;
        recipientAmount1 = _amountToken1 - operatorAmount1;
        operatorAmount0 -= poolPartyAmount0;
        operatorAmount1 -= poolPartyAmount1;

        if (_recipient == operator) {
            recipientAmount0 += operatorAmount0;
            recipientAmount1 += operatorAmount1;
            // _safeTransfer(_position, token0, operator, recipientAmount0);
            // _safeTransfer(_position, token1, operator, recipientAmount1);
        } else {
            _safeTransfer(_position, token0, operator, operatorAmount0);
            _safeTransfer(_position, token1, operator, operatorAmount1);
        }

        _safeTransfer(_position, token0, poolPartyRecipient, poolPartyAmount0);
        _safeTransfer(_position, token1, poolPartyRecipient, poolPartyAmount1);
        emit IPoolPartyPosition.RewardsCollected(
            _recipient,
            positionKey.toId(),
            recipientAmount0,
            recipientAmount1
        );
    }

    function transferTokens(
        IPoolPartyPositionView _position,
        address _recipient,
        uint256 _amountToken0,
        uint256 _amountToken1,
        IPoolPartyPosition.SwapParams calldata _swap
    ) public {
        PositionKey memory positionKey = _position.key();
        address token0 = positionKey.token0;
        address token1 = positionKey.token1;

        if (_swap.shouldSwapFees) {
            // slither-disable-next-line unused-return
            // aderyn-ignore-next-line
            swapToUSDC(
                _position,
                token0,
                _swap.multihopSwapPath0,
                _amountToken0,
                _recipient,
                _swap.amount0OutMinimum
            );
            // slither-disable-next-line unused-return
            // aderyn-ignore-next-line
            swapToUSDC(
                _position,
                token1,
                _swap.multihopSwapPath1,
                _amountToken1,
                _recipient,
                _swap.amount1OutMinimum
            );
        } else {
            _safeTransfer(_position, token0, _recipient, _amountToken0);
            _safeTransfer(_position, token1, _recipient, _amountToken1);
        }
    }

    function swap(
        IPoolPartyPositionView _position,
        address _tokenIn,
        address _tokenOut,
        bytes memory _path,
        uint256 _amountIn,
        address _recipient,
        uint256 _amountOutMinimum
    ) public returns (uint256 amountOut) {
        if (_amountIn == 0) {
            return 0;
        }
        if (_tokenIn == _tokenOut) {
            ERC20(_tokenIn).safeTransfer(_recipient, _amountIn);
            return _amountIn;
        }

        return
            UniswapV3Integration.exactInputMultihopSwap({
                _swapRouter: _position.swapRouter(),
                _tokenIn: _tokenIn,
                _path: _path,
                _recipient: _recipient,
                _amountIn: _amountIn,
                _amountOutMinimum: _amountOutMinimum
            });
    }

    function swapFromUSDC(
        IPoolPartyPositionView _position,
        address _tokenOut,
        bytes memory _path,
        uint256 _amountIn,
        address _recipient,
        uint256 _amountOutMinimum
    ) public returns (uint256 amountOut) {
        address usdc = _position.usdc();
        if (_tokenOut != usdc) {
            _amountIn = _poolPartySwapFeePayment(_position, usdc, _amountIn);
            _amountOutMinimum = _calcPoolPartySwapFee(_amountOutMinimum);
        }
        return
            swap(
                _position,
                usdc,
                _tokenOut,
                _path,
                _amountIn,
                _recipient,
                _amountOutMinimum
            );
    }

    function swapToUSDC(
        IPoolPartyPositionView _position,
        address _tokenIn,
        bytes memory _path,
        uint256 _amountIn,
        address _recipient,
        uint256 _amountOutMinimum
    ) public returns (uint256 amountOut) {
        address usdc = _position.usdc();
        if (_tokenIn != usdc) {
            _amountIn = _poolPartySwapFeePayment(
                _position,
                _tokenIn,
                _amountIn
            );
            _amountOutMinimum = _calcPoolPartySwapFee(_amountOutMinimum);
        }
        return
            swap(
                _position,
                _tokenIn,
                usdc,
                _path,
                _amountIn,
                _recipient,
                _amountOutMinimum
            );
    }

    function withdrawRemainingTokens(IPoolPartyPositionView _position) public {
        if (_position.remainingLiquidityAfterClose() > 0) {
            revert("position has remaining liquidity after close");
        }

        PositionKey memory positionKey = _position.key();
        address token0 = positionKey.token0;
        address token1 = positionKey.token1;

        address poolPartyRecipient = _position.poolPartyRecipient();
        _safeTransfer(
            _position,
            token0,
            poolPartyRecipient,
            ERC20(token0).balanceOf(address(_position))
        );
        _safeTransfer(
            _position,
            token1,
            poolPartyRecipient,
            ERC20(token1).balanceOf(address(_position))
        );
    }

    /// @notice Refund with the unwrapped WETH9 or token to the recipient address.
    function refundWithUnwrapedWETHOrToken(
        IPoolPartyPositionView _position,
        address _token,
        uint256 _value,
        address _recipient
    ) public {
        if (_value == 0) {
            return;
        }
        uint256 balanceWETH9 = IWETH9(_token).balanceOf(address(_position));
        if (_token == _position.WETH9() && balanceWETH9 >= _value) {
            IWETH9(_token).withdraw(_value);
            TransferHelper.safeTransferETH(_recipient, _value);
        } else {
            ERC20(_token).safeTransfer(_recipient, _value);
        }
    }

    /// @notice Wrap ETH to WETH9 and deposit it to the contract.
    /// Otherwise, transfer the token to the recipient address.
    function wrapETHOrTransferToken(
        IPoolPartyPositionView _position,
        address _token,
        uint256 _value,
        address _from,
        address _recipient
    ) public {
        if (_value == 0) {
            return;
        }
        if (
            _token == _position.WETH9() && address(_position).balance >= _value
        ) {
            IWETH9(_token).deposit{value: _value}();
        } else {
            ERC20(_token).safeTransferFrom(_from, _recipient, _value);
        }
    }

    function computeUSDCToPairTokenAmounts(
        PositionKey memory positionKey,
        uint256 _amountUSDC
    ) public view returns (uint256 amount0, uint256 amount1) {
        //slither-disable-next-line unused-return
        (uint160 sqrtPriceX96Pool, , , , , , ) = IUniswapV3Pool(
            positionKey.pool
        ).slot0();

        uint256 ratio = RatioMath.ratio(positionKey, sqrtPriceX96Pool, false);

        /// @dev 10_000 is used to convert the ratio to a percentage with 4 decimals of precision
        amount0 = (_amountUSDC * ratio) / 10_000;
        amount1 = _amountUSDC - amount0;
    }

    function computeMinAmount(
        uint256 _amountIn
    ) public pure returns (uint256 minAmountOut) {
        /// @dev 2000 is 2%, then the max slippage is 2% of the amountIn
        uint256 slippageAmount = ((_amountIn * 2000) / 100_000);
        minAmountOut = _amountIn - slippageAmount;
    }

    function _safeTransfer(
        IPoolPartyPositionView _position,
        address _token,
        address _to,
        uint256 _amount
    ) public {
        refundWithUnwrapedWETHOrToken(_position, _token, _amount, _to);
    }

    function _calcPoolPartySwapFee(
        uint256 _amountIn
    ) public pure returns (uint256) {
        if (_amountIn == 0) {
            return 0;
        }
        uint256 amount = (_amountIn * SWAP_FEE) / FEE_DIVISOR;
        return amount;
    }

    function _poolPartySwapFeePayment(
        IPoolPartyPositionView _position,
        address _tokenIn,
        uint256 _amountIn
    ) public returns (uint256) {
        if (_amountIn == 0) {
            return 0;
        }
        uint256 amount = _calcPoolPartySwapFee(_amountIn);
        uint256 poolPartyAmount = _amountIn - amount;
        if (poolPartyAmount > 0) {
            _safeTransfer(
                _position,
                _tokenIn,
                _position.poolPartyRecipient(),
                poolPartyAmount
            );
        }
        return amount;
    }
}
