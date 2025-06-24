// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import {IUniswapV3Factory} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import {PoolPartyPosition, PoolPartyPositionStorage} from "../PoolPartyPosition.sol";
import "../interfaces/IPoolPartyPositionFactory.sol";

contract PoolPartyPositionFactory is
    IPoolPartyPositionFactory,
    AccessControlDefaultAdminRules,
    Pausable
{
    using PositionIdLib for PositionKey;

    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant DESTROYER_ROLE = keccak256("DESTROYER_ROLE");

    UpgradeableBeacon private immutable i_upgradeableBeacon;
    mapping(PositionId => address proxy) private s_proxies;
    mapping(bytes32 hashedName => bool) private s_poolPositionNames;
    bool public s_destroyed;

    modifier whenNotDestroyed() {
        require(!s_destroyed, "PoolPartyPositionFactory: DESTROYED");
        _;
    }

    modifier onlyAdminOrManager() {
        _checkAdminOrManager();
        _;
    }

    modifier onlyPoolPositionNameNotExist(string memory _name) {
        bytes32 hashedName = keccak256(abi.encodePacked(_name));
        require(
            !s_poolPositionNames[hashedName],
            "PoolPartyPositionFactory: Pool Position Name already exists"
        );
        _;
    }

    constructor(
        address _admin,
        address _upgrader,
        address _pauser,
        address _destroyer
    ) AccessControlDefaultAdminRules(5 days, _admin) {
        i_upgradeableBeacon = new UpgradeableBeacon(
            address(new PoolPartyPosition()),
            address(this)
        );
        _grantRole(UPGRADER_ROLE, _upgrader);
        _grantRole(PAUSER_ROLE, _pauser);
        _grantRole(DESTROYER_ROLE, _destroyer);
    }

    function pause()
        external
        onlyRole(PAUSER_ROLE)
        whenNotDestroyed
        whenNotPaused
    {
        _pause();
    }

    function unpause()
        external
        onlyRole(PAUSER_ROLE)
        whenNotDestroyed
        whenPaused
    {
        _unpause();
    }

    function destroy() external onlyRole(DESTROYER_ROLE) whenNotDestroyed {
        s_destroyed = true;
        emit Destroyed();
    }

    function setManager(
        address _manager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            _manager != address(0),
            "PoolPartyPositionFactory: Invalid manager"
        );
        _grantRole(MANAGER_ROLE, _manager);
    }

    function create(
        IPoolPartyPosition.ConstructorParams calldata _params
    )
        external
        onlyAdminOrManager
        onlyPoolPositionNameNotExist(_params.name)
        returns (IPoolPartyPosition poolPosition)
    {
        address pool = IUniswapV3Factory(_params.uniswapV3Factory).getPool(
            _params.token0,
            _params.token1,
            _params.fee
        );
        bytes32 hashedName = keccak256(abi.encodePacked(_params.name));
        PositionKey memory positionKey = PositionKey({
            pool: pool,
            operator: _params.operator,
            operatorFee: _params.operatorFee,
            token0: _params.token0,
            token1: _params.token1,
            fee: _params.fee,
            tickLower: _params.tickLower,
            tickUpper: _params.tickUpper,
            name: hashedName
        });
        PositionId positionId = positionKey.toId();

        poolPosition = IPoolPartyPosition(s_proxies[positionId]);
        if (address(poolPosition) != address(0)) {
            require(
                poolPosition.isClosed(),
                "PoolPartyPositionFactory: Position is not closed"
            );
        }

        bytes memory data = abi.encodeWithSelector(
            PoolPartyPositionStorage.initialize.selector,
            _params
        );
        // slither-disable-next-line reentrancy-benign
        poolPosition = IPoolPartyPosition(
            address(new BeaconProxy(address(i_upgradeableBeacon), data))
        );
        s_proxies[positionId] = address(poolPosition);
        s_poolPositionNames[hashedName] = true;
    }

    function upgradeTo(address _impl) external onlyRole(UPGRADER_ROLE) {
        i_upgradeableBeacon.upgradeTo(_impl);
    }

    function getImplementation()
        external
        view
        onlyAdminOrManager
        returns (address)
    {
        return i_upgradeableBeacon.implementation();
    }

    function getProxy(
        PositionId _positionId
    ) external view onlyAdminOrManager returns (address) {
        return s_proxies[_positionId];
    }

    function updatePoolPartyPosition(
        PositionId _oldPositionId,
        PositionId _newPositionId
    ) external onlyAdminOrManager returns (address) {
        s_proxies[_newPositionId] = s_proxies[_oldPositionId];
        return s_proxies[_newPositionId];
    }

    function getPoolPartyPosition(
        PositionId _positionId
    ) external view onlyAdminOrManager returns (IPoolPartyPosition) {
        return IPoolPartyPosition(s_proxies[_positionId]);
    }

    function _checkAdminOrManager() private view {
        if (
            !hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) &&
            !hasRole(MANAGER_ROLE, _msgSender())
        ) {
            revert("PoolPartyPositionFactory: Not authorized");
        }
    }

    function _computeAddress(
        IPoolPartyPosition.ConstructorParams calldata _params,
        bytes32 _salt
    ) private view returns (address) {
        // slither-disable-start too-many-digits
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                _salt,
                keccak256(
                    abi.encodePacked(
                        type(BeaconProxy).creationCode,
                        abi.encode(
                            address(i_upgradeableBeacon),
                            abi.encodeWithSelector(
                                PoolPartyPositionStorage.initialize.selector,
                                (_params)
                            )
                        )
                    )
                )
            )
        );
        // slither-disable-end too-many-digits
        return address(uint160(uint(hash)));
    }
}
