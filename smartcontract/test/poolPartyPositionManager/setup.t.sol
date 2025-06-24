// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {IAllowanceTransfer} from "@uniswap/permit2/src/interfaces/IAllowanceTransfer.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IPoolPartyPosition} from "../../src/interfaces/IPoolPartyPosition.sol";
import {IPoolPartyPositionManager} from "../../src/interfaces/IPoolPartyPositionManager.sol";
import {PoolPartyPositionManager} from "../../src/PoolPartyPositionManager.sol";
import {PoolPartyPositionFactory} from "../../src/factories/PoolPartyPositionFactory.sol";
import {PositionKey} from "../../src/types/PositionKey.sol";
import {PositionId} from "../../src/types/PositionId.sol";
import {DeployPoolPartyPositionManagerScript} from "../../script/devnet/DeployPoolPartyPositionManager.s.sol";

import {Test, console} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";

import {ERC20Mock} from "../mocks/ERC20Mock.sol";
import {NonfungiblePositionManagerMock} from "../mocks/NonfungiblePositionManagerMock.sol";
import {UniswapV3FactoryMock, UniswapV3PoolMock} from "../mocks/UniswapV3FactoryMock.sol";
import {UniswapV3SwapRouterMock} from "../mocks/UniswapV3SwapRouterMock.sol";
import {Permit2Mock} from "../mocks/Permit2Mock.sol";

contract PoolPartyPositionManagerSetup is StdInvariant, Test {
    uint256 public constant MULTIPLIER0 = 1e18;
    uint256 public constant MULTIPLIER1 = 1e6;

    NonfungiblePositionManagerMock public nonfungiblePositionManagerMock;
    UniswapV3FactoryMock public uniswapV3FactoryMock;
    Permit2Mock public permit2Mock;
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

    address public SWAP_ROUTER = address(0x0);

    uint24 public poolPartyFee = 3000; // 30%
    uint24 public operatorFee = 1000; // 10%

    PositionId public positionId;
    IPoolPartyPosition public s_poolPartyPosition;
    IPoolPartyPositionManager public poolManager;

    function _investor1Proof() public pure returns (bytes32[] memory proof) {
        proof = new bytes32[](5);
        proof[0] = bytes32(
            0x00314e565e0574cb412563df634608d76f5c59d9f817e85966100ec1d48005c0
        );
        proof[1] = bytes32(
            0x63a46f67e9189bdcdb21615c112669407877af2ee7af46755c74cf546e5d46e4
        );
        proof[2] = bytes32(
            0x3c649c94d05e470f9288e28edd8adfeccf413916f1aa5f3e32ecddf9a1451691
        );
        proof[3] = bytes32(
            0x2d7cc71731839175e7db5a4b3b01c4c7a0a07f9a91be22d4301fe1394b8b0fcb
        );
        proof[4] = bytes32(
            0x394acb6361891bfd9944eea95ffdee19c5759bccdcd9afd07c3fac4c48c71707
        );
    }

    function initialConfig(int24 tickLower, int24 tickUpper) public {
        USDC = new ERC20Mock(6);
        WETH9 = new ERC20Mock(18);
        token0 = new ERC20Mock(18);
        token0.mint(operator, 1000);
        token0.mint(investor1, 1000);
        token1 = new ERC20Mock(6);
        token1.mint(operator, 1000);
        token1.mint(investor1, 1000);

        uint24 fee = 3000;
        uint256 amount0Desired = 100 * MULTIPLIER0;
        uint256 amount1Desired = 100 * MULTIPLIER1;
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
        permit2Mock = new Permit2Mock();

        DeployPoolPartyPositionManagerScript deployer = new DeployPoolPartyPositionManagerScript();

        poolManager = deployer.deploy({
            _admin: ADMIN,
            _upgrader: UPGRADER,
            _pauser: PAUSER,
            _destroyer: DESTROYER,
            _nonfungiblePositionManager: address(
                nonfungiblePositionManagerMock
            ),
            _uniswapV3Factory: address(uniswapV3FactoryMock),
            _uniswapV3SwapRouter: SWAP_ROUTER,
            _permit2: address(permit2Mock),
            _usdc: address(USDC),
            _WETH9: address(WETH9),
            _poolPartyRecipient: poolPartyRecipient,
            _rootForOperatorsWhitelist: 0xa519e7835e6e5effcbbda5d6745690076c3d688ca6027d6d6a6c575d89e1916a,
            _rootForInvestorsWhitelist: 0x4188169e1ef736adceaf1a68ea2f828016a4d37e480c66af4a31b7ed25c4d915,
            _maxInvestment: 100_000_000_000 * MULTIPLIER1
        });

        // poolManager.setRootForOperatorsWhitelist(
        //     0x92c6d9d1c25b98147b5d09c80413526060525eff03b235d6b9f15377cbdae59a
        // );
        // poolManager.setRootForInvestorsWhitelist(
        //     0xef4506ffc3bcb7062a2d67efe682e7139c152528a6dcc0dc7fb8e8bdb3e42549
        // );

        vm.startBroadcast(operator);
        token0.approve(address(permit2Mock), amount0Desired);
        token1.approve(address(permit2Mock), amount1Desired);

        IAllowanceTransfer.PermitDetails[]
            memory details = new IAllowanceTransfer.PermitDetails[](2);
        details[0] = IAllowanceTransfer.PermitDetails({
            token: address(token0),
            amount: uint160(amount0Desired),
            nonce: 0,
            expiration: 1000
        });
        details[1] = IAllowanceTransfer.PermitDetails({
            token: address(token1),
            amount: uint160(amount1Desired),
            nonce: 0,
            expiration: 1000
        });
        IAllowanceTransfer.PermitBatch memory permitBatch = IAllowanceTransfer
            .PermitBatch({
                spender: address(poolManager),
                sigDeadline: block.timestamp + 1000,
                details: details
            });

        bytes32[] memory proof = new bytes32[](4);
        proof[0] = bytes32(
            0xe9707d0e6171f728f7473c24cc0432a9b07eaaf1efed6a137a4a8c12c79552d9
        );
        proof[1] = bytes32(
            0xe16771f53911828111aad3044c1b72093f0eaaa4ca12522cdb29ff4572962bd4
        );
        proof[2] = bytes32(
            0xb36a4b35aa98fb7beb46c0b6ef77f926766ef7d6d3dafb03a98a3b814ea7d722
        );
        proof[3] = bytes32(
            0x44b87946123e03197dbaf4303e6e7048098f50f8987c4cd8d8fae1210f65be05
        );

        positionId = poolManager.createPosition(
            IPoolPartyPositionManager.CreatePositionParams({
                proof: proof,
                permitBatch: permitBatch,
                signature: bytes("dummy"),
                fee: fee,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Min: amount0Min,
                amount1Min: amount1Min,
                deadline: deadline,
                sqrtPriceX96: 0,
                featureSettings: IPoolPartyPositionManager.FeatureSettings({
                    name: "New Pool Party",
                    description: "New Pool Party Description",
                    operatorFee: operatorFee,
                    hiddenFields: IPoolPartyPositionManager.HiddenFields({
                        showPriceRange: false,
                        showTokenPair: false,
                        showInOutRange: false
                    })
                })
            })
        );
        vm.stopBroadcast();

        address _poolPartyPosition = poolManager.operatorPosition(positionId);
        s_poolPartyPosition = IPoolPartyPosition(_poolPartyPosition);
        nonfungiblePositionManagerMock.setPoolPosition(s_poolPartyPosition);
    }
}
