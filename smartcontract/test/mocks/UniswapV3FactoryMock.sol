// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {Test, console} from "forge-std/Test.sol";

contract UniswapV3PoolMock {
    uint160 s_sqrtPriceX96 = 1553792102639747150997811827310592;

    constructor() {}

    function setSqrtPriceX96(uint160 _sqrtPriceX96) external {
        s_sqrtPriceX96 = _sqrtPriceX96;
    }

    function slot0()
        external
        view
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        )
    {
        return (s_sqrtPriceX96, 197687, 0, 0, 0, 0, false);
    }
}

contract UniswapV3FactoryMock {
    UniswapV3PoolMock public i_pool;

    constructor(address _pool) {
        i_pool = UniswapV3PoolMock(_pool);
    }

    function getPool(address, address, uint24) external view returns (address) {
        return address(i_pool);
    }

    function setSqrtPriceX96(uint160 _sqrtPriceX96) external {
        i_pool.setSqrtPriceX96(_sqrtPriceX96);
    }
}
