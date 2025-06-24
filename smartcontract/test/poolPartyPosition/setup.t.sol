// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IPoolPartyPosition} from "../../src/interfaces/IPoolPartyPosition.sol";
import {PoolPartyPosition} from "../../src/PoolPartyPosition.sol";
import {PositionKey} from "../../src/types/PositionKey.sol";
import {PoolPartyPositionFactory} from "../../src/factories/PoolPartyPositionFactory.sol";

import {Test, console} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";

import {PoolPartyPositionHandler} from "./PoolPartyPositionHandler.invariant.sol";

import {ERC20Mock} from "../mocks/ERC20Mock.sol";
import {NonfungiblePositionManagerMock} from "../mocks/NonfungiblePositionManagerMock.sol";
import {UniswapV3FactoryMock, UniswapV3PoolMock} from "../mocks/UniswapV3FactoryMock.sol";
import {UniswapV3SwapRouterMock} from "../mocks/UniswapV3SwapRouterMock.sol";

abstract contract SetupTest is StdInvariant, Test {
    uint256 private constant MULTIPLIER0 = 1e6;
    uint256 private constant MULTIPLIER1 = 1e18;

    NonfungiblePositionManagerMock public nonfungiblePositionManagerMock;
    UniswapV3FactoryMock public uniswapV3FactoryMock;
    PoolPartyPosition public s_poolPartyPosition;
    ERC20Mock public token0;
    ERC20Mock public token1;
    ERC20Mock public USDC;
    ERC20Mock public WETH9;

    address public ADMIN = address(0x1656563782892739834);
    address public UPGRADER = address(0x1609932563782892739834);
    address public PAUSER = address(0x2609932563782892739834);
    address public DESTROYER = address(0x3609932563782892739834);
    address public poolPartyRecipient = address(0x1234567890);
    address public operator = address(0x9876543210);
    address public investor1 = address(0x1);
    address public investor2 = address(0x2);
    address public poolManager = address(0x1773689902834674);

    address public SWAP_ROUTER = address(0x0);

    uint24 public poolPartyFee = 3000; // 30%
    uint24 public operatorFee = 1000; // 10%

    PoolPartyPositionHandler public s_handler;

    function setUp() public {
        USDC = new ERC20Mock(6);
        WETH9 = new ERC20Mock(18);
        token0 = new ERC20Mock(6);
        token0.mint(operator, 1000);
        token0.mint(investor1, 1000);
        token1 = new ERC20Mock(18);
        token1.mint(operator, 1000);
        token1.mint(investor1, 1000);

        uint24 fee = 10000;
        int24 tickLower = 189600; //197687
        int24 tickUpper = 205600;
        uint256 amount0Desired = 43838847;
        uint256 amount1Desired = 4670918248268098;
        uint256 amount0Min = 1 * MULTIPLIER0;
        uint256 amount1Min = 1 * MULTIPLIER1;
        uint256 deadline = block.timestamp + 1000;

        nonfungiblePositionManagerMock = new NonfungiblePositionManagerMock(
            token0,
            token1,
            tickLower,
            tickUpper
        );
        uniswapV3FactoryMock = new UniswapV3FactoryMock(
            address(new UniswapV3PoolMock())
        );
        SWAP_ROUTER = address(new UniswapV3SwapRouterMock());

        vm.startBroadcast(ADMIN);
        PoolPartyPositionFactory factory = new PoolPartyPositionFactory(
            ADMIN,
            UPGRADER,
            PAUSER,
            DESTROYER
        );
        factory.setManager(address(poolManager));
        vm.stopBroadcast();

        vm.startBroadcast(poolManager);

        s_poolPartyPosition = PoolPartyPosition(
            payable(
                address(
                    factory.create(
                        IPoolPartyPosition.ConstructorParams({
                            admin: ADMIN,
                            upgrader: UPGRADER,
                            manager: address(poolManager),
                            nonfungiblePositionManager: address(
                                nonfungiblePositionManagerMock
                            ),
                            uniswapV3Factory: address(uniswapV3FactoryMock),
                            uniswapV3SwapRouter: address(SWAP_ROUTER),
                            usdc: address(USDC),
                            WETH9: address(WETH9),
                            operator: operator,
                            operatorFee: operatorFee,
                            poolPartyRecipient: poolPartyRecipient,
                            poolPartyFee: poolPartyFee,
                            token0: address(token0),
                            token1: address(token1),
                            fee: fee,
                            tickLower: tickLower,
                            tickUpper: tickUpper,
                            // sqrtPriceX96: sqrtPriceX96
                            name: "PoolPartyPosition Name"
                        })
                    )
                )
            )
        );
        vm.stopBroadcast();

        assertEq(s_poolPartyPosition.inRange(), 0, "position is in range");

        PositionKey memory positionKey = s_poolPartyPosition.key();
        assertEq(
            positionKey.name,
            0xac47a8a8123bce5ce5fa2f925175e4e40ed2882c1fc7c86f6a79180b7aca7ba8,
            "position name is not correct"
        );

        nonfungiblePositionManagerMock.setPoolPosition(s_poolPartyPosition);

        vm.startBroadcast(operator);
        token0.approve(address(poolManager), amount0Desired);
        token1.approve(address(poolManager), amount1Desired);
        vm.stopBroadcast();

        vm.startBroadcast(poolManager);
        token0.transferFrom(operator, poolManager, amount0Desired);
        token1.transferFrom(operator, poolManager, amount1Desired);
        token0.approve(address(s_poolPartyPosition), amount0Desired);
        token1.approve(address(s_poolPartyPosition), amount1Desired);

        s_poolPartyPosition.mintPosition(
            IPoolPartyPosition.MintPositionParams({
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: amount0Min,
                amount1Min: amount1Min,
                deadline: deadline
            })
        );
        vm.stopBroadcast();

        // PositionKey memory positionKey = s_poolPartyPosition
        //     .viewManager()
        //     .key();

        // // assertEq(s_poolPartyPosition.inRange(), 0, "position is in range");

        // assertEq(
        //     positionKey.name,
        //     "PoolPartyPosition Name",
        //     "position name is not correct"
        // );

        // assertTrue(positionKey.pool != address(0), "pool address");
        // assertEq(positionKey.operator, operator, "pool operator");
        // assertEq(positionKey.token0, address(token0), "pool token0");
        // assertEq(positionKey.token1, address(token1), "pool token1");
        // assertEq(s_poolPartyPosition.tokenId(), 1, "pool tokenId");
        // assertEq(
        //     s_poolPartyPosition.liquidity(),
        //     716109398931,
        //     "pool liquidity"
        // );
        // assertEq(positionKey.fee, fee, "pool fee");
        // assertEq(positionKey.tickLower, tickLower, "pool tickLower");
        // assertEq(positionKey.tickUpper, tickUpper, "pool tickUpper");

        // assertEq(
        //     s_poolPartyPosition.calculateRewards0Earned(operator),
        //     9999999,
        //     "operator rewards0 after mint"
        // );
        // assertEq(
        //     s_poolPartyPosition.calculateRewards1Earned(operator),
        //     9999999999999999999,
        //     "operator rewards1 after mint"
        // );
        // assertEq(
        //     s_poolPartyPosition.liquidityOf(operator),
        //     716109398931,
        //     "operator liquidity after mint"
        // );

        // s_handler = new PoolPartyPositionHandler(
        //     s_poolPartyPosition,
        //     address(USDC)
        // );
        // targetContract(address(s_handler));
        // targetSender(investor1);

        // bytes4[] memory selectors = new bytes4[](2);
        // selectors[0] = PoolPartyPositionHandler.increaseLiquidty.selector;
        // selectors[1] = PoolPartyPositionHandler.decreaseLiquidty.selector;
        // targetSelector(
        //     FuzzSelector({addr: address(s_handler), selectors: selectors})
        // );
    }
}
