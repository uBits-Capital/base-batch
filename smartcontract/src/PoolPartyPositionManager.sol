// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {Core} from "./library/manager/Core.sol";
import {View} from "./library/manager/View.sol";
import "./storage/PoolPartyPositionManagerStorage.sol";

/**
 * @title PoolPartyPositionManager contract
 * @author uBits Capital
 * @notice This contract manages the positions of the UbitsPoolPosition protocol
 */
contract PoolPartyPositionManager is PoolPartyPositionManagerStorage {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @inheritdoc IPoolPartyPositionManager
    function setRootForOperatorsWhitelist(
        bytes32 _root
    ) external whenNotDestroyed onlyRole(DEFAULT_ADMIN_ROLE) {
        s.rootForOperatorsWhitelist = _root;
    }

    /// @inheritdoc IPoolPartyPositionManager
    function setRootForInvestorsWhitelist(
        bytes32 _root
    ) external whenNotDestroyed onlyRole(DEFAULT_ADMIN_ROLE) {
        s.rootForInvestorsWhitelist = _root;
    }

    /// @inheritdoc IPoolPartyPositionManager
    function setMaxInvestment(
        uint256 _maxInvestment
    ) external whenNotDestroyed onlyRole(DEFAULT_ADMIN_ROLE) {
        s.maxInvestment = _maxInvestment;
    }

    /// @inheritdoc IPoolPartyPositionManager
    function setPoolPartyRecipient(
        address _poolPartyRecipient
    ) external whenNotDestroyed onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            _poolPartyRecipient != address(0),
            "Pool party recipient cannot be the zero address"
        );
        s.poolPartyRecipient = _poolPartyRecipient;
    }

    /// @inheritdoc IPoolPartyPositionManager
    function pause()
        external
        onlyRole(PAUSER_ROLE)
        whenNotDestroyed
        whenNotPaused
    {
        _pause();
    }

    /// @inheritdoc IPoolPartyPositionManager
    function unpause()
        external
        onlyRole(PAUSER_ROLE)
        whenNotDestroyed
        whenPaused
    {
        _unpause();
    }

    /// @inheritdoc IPoolPartyPositionManager
    function destroy() external onlyRole(DESTROYER_ROLE) whenNotDestroyed {
        s.destroyed = true;
        emit Destroyed();
    }

    /// @inheritdoc IPoolPartyPositionManager
    function createPosition(
        CreatePositionParams calldata _params
    )
        external
        payable
        nonReentrant
        whenNotDestroyed
        whenNotPaused
        onlyWhitelistedOperator(_params.proof)
        returns (PositionId positionId)
    {
        return Core.createPosition(s, _params);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function addLiquidity(
        AddLiquidityParams calldata _params
    )
        external
        nonReentrant
        whenNotDestroyed
        whenNotPaused
        // onlyWhitelistedInvestors(_params.proof)
        minInvestmentInUSDC(_params.permit.details.amount)
        maxInvestmentCapInUSDC(_params.permit.details.amount)
        returns (uint128 liquidity, uint256 amount0, uint256 amount1)
    {
        return Core.addLiquidity(s, _params);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function removeLiquidity(
        RemoveLiquidityParams calldata _params
    )
        external
        nonReentrant
        whenNotDestroyed
        whenNotPaused
        returns (uint128 liquidity, uint256 amount0, uint256 amount1)
    {
        return Core.removeLiquidity(s, _params);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function collectRewards(
        CollectParams calldata _params
    )
        external
        nonReentrant
        whenNotDestroyed
        whenNotPaused
        returns (uint256 amount0, uint256 amount1)
    {
        return Core.collectRewards(s, _params);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function changeRange()
        external
        nonReentrant
        whenNotDestroyed
        whenNotPaused
    {}

    /// @inheritdoc IPoolPartyPositionManager
    function closePool(
        ClosePoolParams calldata _params
    )
        external
        nonReentrant
        whenNotDestroyed
        whenNotPaused
        onlyPositionOperator(_params.positionId)
        returns (uint128, uint256, uint256)
    {
        return Core.closePool(s, _params);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function withdraw(
        WithdrawParams calldata _params
    )
        external
        nonReentrant
        whenNotDestroyed
        whenNotPaused
        returns (
            uint256 token0,
            uint256 token1,
            uint256 collected0,
            uint256 collected1
        )
    {
        return Core.withdraw(s, _params);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function operatorPositions(
        address _operator
    ) external view whenNotDestroyed whenNotPaused returns (address[] memory) {
        return View.operatorPositions(s, _operator);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function operatorPosition(
        PositionId _positionId
    ) external view whenNotDestroyed whenNotPaused returns (address) {
        return View.operatorPosition(s, _positionId);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function investorPositions(
        address _investor
    ) external view whenNotDestroyed whenNotPaused returns (address[] memory) {
        return View.investorPositions(s, _investor);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function investorPosition(
        address _investor,
        PositionId _positionId
    ) external view whenNotDestroyed whenNotPaused returns (address) {
        return View.investorPosition(s, _investor, _positionId);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function allPositions()
        external
        view
        whenNotDestroyed
        whenNotPaused
        returns (address[] memory)
    {
        return View.allPositions(s);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function listOfPositionDataBy(
        address _account,
        address[] calldata _positions
    )
        external
        view
        whenNotDestroyed
        whenNotPaused
        returns (InvestorPositionData[] memory)
    {
        return View.listOfPositionDataBy(s, _account, _positions);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function positionData(
        address _position
    ) public view whenNotDestroyed whenNotPaused returns (PositionData memory) {
        return View.positionData(s, _position);
    }

    /// @inheritdoc IPoolPartyPositionManager
    function destroyed() public view returns (bool) {
        return s.destroyed;
    }

    ///@dev required by the OZ UUPS module
    function _authorizeUpgrade(
        address
    ) internal override onlyRole(UPGRADER_ROLE) whenNotDestroyed {}

    receive() external payable {}

    // @todo REMOVE THIS FUNCTION IN THE FUTURE
    function resetMaxInvestment(
        address[] memory _accounts
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        Core.resetMaxInvestment(s, _accounts);
    }
}
