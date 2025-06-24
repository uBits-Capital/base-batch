// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./base/Base.sol";
import {WithdrawPosition} from "./library/WithdrawPosition.sol";
import {MintPosition} from "./library/MintPosition.sol";
import {Liquidity} from "./library/Liquidity.sol";
import {ClosePosition} from "./library/ClosePosition.sol";

/**
 * @title PoolPartyPosition contract
 * @author uBits Capital
 * @notice This is used to create and manage a Uniswap V3 pool position for a group of investors.
 * When a pool position is created, the operator is the owner of the pool position and
 * the operator/investor can add or remove liquidity from the pool position.
 * The operator/investor can also collect rewards from the pool position based on the amount of liquidity they have in the pool position.
 */
contract PoolPartyPosition is Base {
    using PositionIdLib for PositionKey;
    using SafeERC20 for IERC20;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @inheritdoc IPoolPartyPosition
    function mintPosition(
        MintPositionParams memory _params
    )
        external
        payable
        nonReentrant
        onlyRole(MANAGER_ROLE)
        whenManagerNotDestroyed
        whenManagerNotPaused
        returns (
            PositionId positionId,
            uint256 _tokenId,
            uint128 _liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        return MintPosition.mintPosition(s, this, address(this), _params);
    }

    /// @inheritdoc IPoolPartyPosition
    function increaseLiquidty(
        IncreaseLiquidityParams calldata _params
    )
        external
        nonReentrant
        onlyRole(MANAGER_ROLE)
        whenManagerNotDestroyed
        whenManagerNotPaused
        returns (uint128 _liquidity, uint256 amount0, uint256 amount1)
    {
        return Liquidity.increaseLiquidty(s, this, _params);
    }

    /// @inheritdoc IPoolPartyPosition
    function decreaseLiquidity(
        DecreaseLiquidityParams calldata _params
    )
        external
        nonReentrant
        onlyRole(MANAGER_ROLE)
        whenManagerNotDestroyed
        whenManagerNotPaused
        returns (uint128, uint256, uint256)
    {
        return Liquidity.decreaseLiquidity(s, this, _params);
    }

    /// @inheritdoc IPoolPartyPosition
    function collect(
        CollectParams calldata _params
    )
        external
        nonReentrant
        onlyRole(MANAGER_ROLE)
        whenManagerNotDestroyed
        whenManagerNotPaused
        returns (uint256 earned0, uint256 earned1)
    {
        return Rewards.collect(s, this, _params);
    }

    /// @inheritdoc IPoolPartyPosition
    function withdraw(
        WithdrawParams calldata _params
    )
        external
        nonReentrant
        onlyRole(MANAGER_ROLE)
        whenManagerNotDestroyed
        whenManagerNotPaused
        returns (uint256, uint256, uint256, uint256)
    {
        return WithdrawPosition.withdraw(s, this, _params);
    }

    /// @inheritdoc IPoolPartyPosition
    function closePosition(
        ClosePositionParams calldata _params
    )
        external
        nonReentrant
        onlyRole(MANAGER_ROLE)
        whenManagerNotDestroyed
        whenManagerNotPaused
        returns (uint128 liquidity, uint256 amount0, uint256 amount1)
    {
        return ClosePosition.closePosition(s, this, _params);
    }

    ///@dev required by the OZ UUPS module
    function _authorizeUpgrade(
        address
    ) internal override whenManagerNotDestroyed onlyRole(UPGRADER_ROLE) {}

    receive() external payable {
        require(
            msg.sender == s.i_WETH9 || msg.sender == s.i_manager,
            "Not WETH9 or manager"
        );
    }
}
