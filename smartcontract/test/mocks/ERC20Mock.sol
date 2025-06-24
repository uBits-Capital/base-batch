// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    uint8 private s_decimals;

    constructor(uint8 _decimals) ERC20("ERC20Mock", "E20M") {
        s_decimals = _decimals;
    }

    function mint(address account, uint256 amount) public virtual {
        _mint(account, amount * (10 ** s_decimals));
    }

     function mint2(address account, uint256 amount) public virtual {
        _mint(account, amount );
    }

    function decimals() public view virtual override returns (uint8) {
        return s_decimals;
    }
}
