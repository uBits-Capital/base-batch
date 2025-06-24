// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {AccessControlDefaultAdminRulesUpgradeable} from "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlDefaultAdminRulesUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {INonfungiblePositionManager} from "../interfaces/INonfungiblePositionManager.sol";
import {IV3SwapRouter} from "../interfaces/IV3SwapRouter.sol";
import {IPoolPartyPositionManager} from "../interfaces/IPoolPartyPositionManager.sol";
import {IWETH9} from "../interfaces/IWETH9.sol";
import {TickMath} from "../library/uniswap/TickMath.sol";
import {PayMaster} from "../library/PayMaster.sol";
import {UniswapV3Integration} from "../library/UniswapV3Integration.sol";
import "../interfaces/IPoolPartyPosition.sol";

bytes32 constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
bytes32 constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

struct Storage {
    INonfungiblePositionManager i_nonfungiblePositionManager;
    IV3SwapRouter i_uniswapV3SwapRouter;
    IUniswapV3Factory i_uniswapV3Factory;
    address i_WETH9;
    address i_usdc;
    address i_poolPartyRecipient;
    address i_token0;
    address i_token1;
    address i_manager;
    address i_operator;
    uint24 i_operatorFee;
    uint24 i_poolPartyFee;
    uint24 i_fee;
    PositionKey positionKey;
    uint256 tokenId;
    mapping(PositionId => mapping(uint256 tokenId => bool)) isOpen;
    mapping(address => uint128) liquidityOf;
    mapping(address => uint256) earned0Of;
    mapping(address => uint256) earned1Of;
    mapping(address => uint256) rewardIndex0Of;
    mapping(address => uint256) rewardIndex1Of;
    uint256 rewardIndex0;
    uint256 rewardIndex1;
    uint128 liquidity;
    uint128 remainingLiquidityAfterClose;
    uint128 liquidityBeforeClose;
    uint160 sqrtPriceX96BeforeClose;
}

library PoolPartyPositionStorageLib {
    //slither-disable-next-line dead-code
    function getStorage() internal pure returns (Storage storage store) {
        assembly {
            store.slot := 0
        }
    }
}

abstract contract PoolPartyPositionStorage is
    IPoolPartyPosition,
    UUPSUpgradeable,
    AccessControlDefaultAdminRulesUpgradeable,
    ReentrancyGuardUpgradeable
{
    using PositionIdLib for PositionKey;
    // slither-disable-next-line uninitialized-state,reentrancy-no-eth
    Storage internal s;

    modifier whenManagerNotDestroyed() {
        bool destroyed = IPoolPartyPositionManager(s.i_manager).destroyed();
        require(!destroyed, "PoolPartyPosition: DESTROYED");
        _;
    }

    modifier whenManagerNotPaused() {
        bool paused = PausableUpgradeable(s.i_manager).paused();
        require(!paused, "PoolPartyPosition: PAUSED");
        _;
    }

    function initialize(ConstructorParams memory _params) public initializer {
        require(
            _params.token0 != address(0) && _params.token1 != address(0),
            "token0 and token1 must be non-zero addresses"
        );
        require(
            _params.token0 != _params.token1,
            "token0 and token1 must be different"
        );
        require(
            _params.fee == 100 ||
                _params.fee == 500 ||
                _params.fee == 3000 ||
                _params.fee == 10000,
            "fee must be 100, 500, 3000, or 10000"
        );
        require(
            _params.operatorFee >= 1_000 && _params.operatorFee <= 10_000,
            "operator fee must be between 1000 and 10000"
        );
        require(
            _params.operator != address(0),
            "operator must be a non-zero address"
        );
        require(
            _params.poolPartyFee >= 1_000 && _params.poolPartyFee <= 10_000,
            "pool party fee must be between 1000 and 10000"
        );
        require(
            _params.poolPartyRecipient != address(0),
            "pool party recipient must be a non-zero address"
        );
        require(
            _params.uniswapV3SwapRouter != address(0),
            "uniswapV3SwapRouter must be a non-zero address"
        );
        require(
            _params.uniswapV3Factory != address(0),
            "uniswapV3Factory must be a non-zero address"
        );
        require(
            _params.nonfungiblePositionManager != address(0),
            "nonfungiblePositionManager must be a non-zero address"
        );
        require(
            _params.manager != address(0),
            "manager must be a non-zero address"
        );
        require(
            _params.upgrader != address(0),
            "upgrader must be a non-zero address"
        );

        require(
            _params.tickLower < _params.tickUpper,
            "tickLower must be less than tickUpper"
        );
        require(
            _params.tickLower >= TickMath.MIN_TICK &&
                _params.tickUpper <= TickMath.MAX_TICK,
            "tickLower and tickUpper must be within bounds"
        );
        require(_params.usdc != address(0), "usdc must be a non-zero address");
        require(_params.WETH9 != address(0), "WETH9 must be a non-zero address");

        __AccessControlDefaultAdminRules_init(3 days, _params.admin);

        address _pool = IUniswapV3Factory(_params.uniswapV3Factory).getPool(
            _params.token0,
            _params.token1,
            _params.fee
        );

        require(_pool != address(0), "Pool does not exist");

        //slither-disable-next-line unused-return
        (uint160 sqrtPriceX96Existing, , , , , , ) = IUniswapV3Pool(_pool)
            .slot0();

        require(sqrtPriceX96Existing != 0, "Pool not initialized");

        PositionKey memory _positionKey = PositionKey({
            pool: _pool,
            operator: _params.operator,
            operatorFee: _params.operatorFee,
            token0: _params.token0,
            token1: _params.token1,
            fee: _params.fee,
            tickLower: _params.tickLower,
            tickUpper: _params.tickUpper,
            name: keccak256(abi.encodePacked(_params.name))
        });
        PositionId positionId = _positionKey.toId();

        require(
            !s.isOpen[positionId][s.tokenId],
            "Pool position already created"
        );

        s.i_nonfungiblePositionManager = INonfungiblePositionManager(
            _params.nonfungiblePositionManager
        );
        s.i_uniswapV3SwapRouter = IV3SwapRouter(_params.uniswapV3SwapRouter);
        s.i_uniswapV3Factory = IUniswapV3Factory(_params.uniswapV3Factory);
        s.i_WETH9 = _params.WETH9;
        s.i_usdc = _params.usdc;
        s.i_manager = _params.manager;
        s.i_poolPartyRecipient = _params.poolPartyRecipient;
        s.i_poolPartyFee = _params.poolPartyFee;
        s.i_operator = _params.operator;
        s.i_operatorFee = _params.operatorFee;
        s.i_token0 = _params.token0;
        s.i_token1 = _params.token1;
        s.i_fee = _params.fee;
        s.positionKey = _positionKey;

        _grantRole(MANAGER_ROLE, _params.manager);
        _grantRole(UPGRADER_ROLE, _params.upgrader);
    }
}
