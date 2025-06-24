// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {AccessControlDefaultAdminRulesUpgradeable} from "@openzeppelin/contracts-upgradeable/access/extensions/AccessControlDefaultAdminRulesUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {TickMath} from "../library/uniswap/TickMath.sol";
import {IPoolPartyPosition, PERCENTAGE_MULTIPLIER} from "../interfaces/IPoolPartyPosition.sol";
import {IWETH9} from "../interfaces/IWETH9.sol";
import "../interfaces/IPoolPartyPositionManager.sol";
import {IPoolPartyPositionFactory} from "../interfaces/IPoolPartyPositionFactory.sol";
import {PositionId} from "../types/PositionId.sol";

bytes32 constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
bytes32 constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
bytes32 constant DESTROYER_ROLE = keccak256("DESTROYER_ROLE");

struct Storage {
    address i_admin;
    address i_upgrader;
    IPoolPartyPositionFactory i_poolPositionFactory;
    IAllowanceTransfer i_permit2;
    address i_nonfungiblePositionManager;
    address i_uniswapV3Factory;
    address i_swapRouter;
    address i_usdc;
    address i_WETH9;
    mapping(PositionId => address operator) operatorByPositionId;
    mapping(address investor => address[] positions) positionsByInvestor;
    mapping(address investor => mapping(PositionId => address position)) positionByInvestorAndId;
    mapping(PositionId => IPoolPartyPositionManager.FeatureSettings) featureSettings;
    mapping(address investor => uint256) totalInvestmentsByInvestor;
    mapping(PositionId => uint256 investors) totalInvestorsByPosition;
    mapping(PositionId => mapping(address investor => bool invested)) positionInvestedBy;
    address[] positions;
    uint256 maxInvestment;
    address poolPartyRecipient;
    uint24 poolPartyFee;
    bytes32 rootForOperatorsWhitelist;
    bytes32 rootForInvestorsWhitelist;
    bool destroyed;
}

library PoolPartyPositionManagerStorageLib {
    //slither-disable-next-line dead-code
    function getStorage() internal pure returns (Storage storage store) {
        assembly {
            store.slot := 0
        }
    }
}

abstract contract PoolPartyPositionManagerStorage is
    IPoolPartyPositionManager,
    UUPSUpgradeable,
    AccessControlDefaultAdminRulesUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    // slither-disable-next-line uninitialized-state,reentrancy-no-eth
    Storage internal s;

    modifier whenNotDestroyed() {
        require(!s.destroyed, "PoolPartyPositionManager: DESTROYED");
        _;
    }

    modifier onlyPositionOperator(PositionId _positionId) {
        require(
            s.operatorByPositionId[_positionId] == msg.sender,
            "PoolPartyPositionManager: NOT_POSITION_OPERATOR"
        );
        _;
    }

    modifier onlyWhitelistedOperator(bytes32[] calldata _proof) {
        require(
            _verifyProof(_proof, s.rootForOperatorsWhitelist),
            "PoolPartyPositionManager: OPERATOR_NOT_WHITELISTED"
        );
        _;
    }

    modifier onlyWhitelistedInvestors(bytes32[] calldata _proof) {
        require(
            _verifyProof(_proof, s.rootForInvestorsWhitelist),
            "PoolPartyPositionManager: INVESTOR_NOT_WHITELISTED"
        );
        _;
    }

    modifier minInvestmentInUSDC(uint160 _amount) {
        require(
            _amount >= 10 * 1e6,
            "PoolPartyPositionManager: MIN_INVESTMENT_NOT_MET"
        );
        _;
    }

    modifier maxInvestmentCapInUSDC(uint160 _amount) {
        uint256 percentage = _amount / (s.maxInvestment / 100);
        require(
            (s.totalInvestmentsByInvestor[msg.sender] + percentage) <= 100,
            "PoolPartyPositionManager: MAX_INVESTMENT_EXCEEDED"
        );
        s.totalInvestmentsByInvestor[msg.sender] += percentage;
        _;
    }

    function initialize(ConstructorParams memory _params) public initializer {
        require(
            _params.nonfungiblePositionManager != address(0),
            "NonfungiblePositionManager cannot be the zero address"
        );
        require(
            _params.uniswapV3Factory != address(0),
            "UniswapV3Factory cannot be the zero address"
        );
        require(
            _params.poolPositionFactory != address(0),
            "PoolPositionFactory cannot be the zero address"
        );
        require(
            _params.poolPartyRecipient != address(0),
            "Pool party recipient cannot be the zero address"
        );
        require(
            _params.uniswapV3SwapRouter != address(0),
            "UniswapV3SwapRouter cannot be the zero address"
        );
        require(
            _params.usdc != address(0),
            "USDC token cannot be the zero address"
        );
        require(
            _params.WETH9 != address(0),
            "WETH9 must be a non-zero address"
        );

        __AccessControlDefaultAdminRules_init(3 days, _params.admin);

        s.i_admin = _params.admin;
        s.i_upgrader = _params.upgrader;
        s.i_nonfungiblePositionManager = _params.nonfungiblePositionManager;
        s.i_uniswapV3Factory = _params.uniswapV3Factory;
        s.i_swapRouter = _params.uniswapV3SwapRouter;
        s.i_permit2 = IAllowanceTransfer(_params.permit2);
        s.i_WETH9 = _params.WETH9;
        s.i_usdc = _params.usdc;
        s.i_poolPositionFactory = IPoolPartyPositionFactory(
            _params.poolPositionFactory
        );
        s.poolPartyRecipient = _params.poolPartyRecipient;
        s.poolPartyFee = 5_000; // 50%
        s.rootForOperatorsWhitelist = _params.rootForOperatorsWhitelist;
        s.rootForInvestorsWhitelist = _params.rootForInvestorsWhitelist;

        _grantRole(UPGRADER_ROLE, _params.upgrader);
        // _grantRole(PAUSER_ROLE, _params.pauser);
        // _grantRole(DESTROYER_ROLE, _params.destroyer);
    }

    function _verifyProof(
        bytes32[] memory _proof,
        bytes32 _root
    ) private view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        return MerkleProof.verify(_proof, _root, leaf);
    }
}
