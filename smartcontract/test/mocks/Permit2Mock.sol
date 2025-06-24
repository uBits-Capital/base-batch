// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IAllowanceTransfer} from "@uniswap/permit2/src/interfaces/IAllowanceTransfer.sol";

contract Permit2Mock {
    function permit(
        address owner,
        IAllowanceTransfer.PermitSingle memory permitSingle,
        bytes calldata signature
    ) external {}

    function permit(
        address owner,
        IAllowanceTransfer.PermitBatch memory permitBatch,
        bytes calldata signature
    ) external {}

    function transferFrom(
        address from,
        address to,
        uint160 amount,
        address token
    ) external {
        ERC20(token).transferFrom(from, to, amount);
    }
}
