// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ISwapRouter} from "../../src/interfaces/ISwapRouter.sol";
import {ERC20Mock} from "./ERC20Mock.sol";
import {Test, console} from "forge-std/Test.sol";

contract UniswapV3SwapRouterMock {
    using SafeERC20 for ERC20;

    function exactInputSingle(
        ISwapRouter.ExactInputSingleParams calldata params
    ) external payable returns (uint256 amountOut) {
        ERC20(params.tokenIn).safeTransferFrom(
            msg.sender,
            address(this),
            params.amountIn
        );

        ERC20Mock(params.tokenOut).mint2(params.recipient, params.amountIn);

        return params.amountIn;
    }
}
