// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {UniswapV3Integration} from "./UniswapV3Integration.sol";
import {Storage} from "../storage/PoolPartyPositionStorage.sol";
import {PayMaster} from "./PayMaster.sol";
import {Liquidity} from "./Liquidity.sol";
import "../interfaces/IPoolPartyPosition.sol";

library Rewards {
    function collect(
        Storage storage s,
        IPoolPartyPositionView _position,
        IPoolPartyPosition.CollectParams calldata _params
    ) external returns (uint256 earned0, uint256 earned1) {
        //slither-disable-next-line timestamp
        require(
            _params.deadline >= block.timestamp,
            "Deadline must be in the future"
        );

        require(
            _params.investor != address(0),
            "Investor must be a non-zero address"
        );

        if (
            _params.swap.shouldSwapFees &&
            (_params.swap.multihopSwapPath0.length == 0 &&
                _params.swap.multihopSwapPath1.length == 0)
        ) {
            revert("Multihop Swap path is required");
        }

        Liquidity.updateLiquidity(s);
        updateRewardsOf(s, _params.investor, address(_position));

        earned0 = s.earned0Of[_params.investor];
        earned1 = s.earned1Of[_params.investor];

        require(earned0 > 0 || earned1 > 0, "No rewards to collect");

        s.earned0Of[_params.investor] = 0;
        s.earned1Of[_params.investor] = 0;
 
        (uint256 collectedFees0, uint256 collectedFees1) = PayMaster
            .splitCollectedFees(_position, _params.investor, earned0, earned1);

        PayMaster.transferTokens(
            _position,
            _params.investor,
            collectedFees0,
            collectedFees1,
            _params.swap
        );
    }

    function updateRewardsOf(
        Storage storage s,
        address _account,
        address _recipient
    ) internal {
        // slither-disable-start reentrancy-no-eth
        _updateRewardIndex(s, _recipient);
        s.earned0Of[_account] += _calculateRewards0(s, _account);
        s.rewardIndex0Of[_account] = s.rewardIndex0;
        s.earned1Of[_account] += _calculateRewards1(s, _account);
        s.rewardIndex1Of[_account] = s.rewardIndex1;
        // slither-disable-end reentrancy-no-eth
    }

    function _calculateRewards0(
        Storage storage s,
        address _account
    ) internal view returns (uint256) {
        return
            (s.liquidityOf[_account] *
                (s.rewardIndex0 - s.rewardIndex0Of[_account])) / 1e20;
    }

    function _calculateRewards1(
        Storage storage s,
        address _account
    ) internal view returns (uint256) {
        return
            (s.liquidityOf[_account] *
                (s.rewardIndex1 - s.rewardIndex1Of[_account])) / 1e20;
    }

    function _calculateVirtualRewards0(
        Storage storage s,
        address _account
    ) internal view returns (uint256) {
        //slither-disable-next-line unused-return
        (uint256 rewardIndex0, , , ) = _calculateVirtualRewardIndexes(s);
        //slither-disable-next-line unused-return

        uint256 rewardIndex = (s.rewardIndex0 + rewardIndex0) -
            s.rewardIndex0Of[_account];

        return
            s.earned0Of[_account] +
            ((s.liquidityOf[_account] * rewardIndex) / 1e20);
    }

    function _calculateVirtualRewards1(
        Storage storage s,
        address _account
    ) internal view returns (uint256) {
        //slither-disable-next-line unused-return
        (, uint256 rewardIndex1, , ) = _calculateVirtualRewardIndexes(s);
        //slither-disable-next-line unused-return

        uint256 rewardIndex = (s.rewardIndex1 + rewardIndex1) -
            s.rewardIndex1Of[_account];

        return
            s.earned1Of[_account] +
            ((s.liquidityOf[_account] * rewardIndex) / 1e20);
    }

    function _updateRewardIndex(
        Storage storage s,
        address _recipient
    ) internal {
        (uint256 tokensOwed0, uint256 tokensOwed1) = UniswapV3Integration
            .collect(s, _recipient, type(uint128).max, type(uint128).max);

        //slither-disable-next-line unused-return
        (, , uint128 liquidity, , ) = UniswapV3Integration.getPoolPositionInfo(
            s
        );

        (uint256 rewardIndex0, uint256 rewardIndex1) = _rewardsIndexes(
            liquidity,
            tokensOwed0,
            tokensOwed1
        );

        s.rewardIndex0 += rewardIndex0;
        s.rewardIndex1 += rewardIndex1;
    }

    function _calculateVirtualRewardIndexes(
        Storage storage s
    )
        public
        view
        returns (
            uint256 rewardIndex0,
            uint256 rewardIndex1,
            uint256 tokensOwed0,
            uint256 tokensOwed1
        )
    {
        uint128 liquidity;
        //slither-disable-next-line unused-return
        (, , liquidity, tokensOwed0, tokensOwed1) = UniswapV3Integration
            .getPoolPositionInfo(s);

        (rewardIndex0, rewardIndex1) = _rewardsIndexes(
            liquidity,
            tokensOwed0,
            tokensOwed1
        );
    }

    function _rewardsIndexes(
        uint128 _liquidity,
        uint256 _tokensOwed0,
        uint256 _tokensOwed1
    ) public pure returns (uint256 rewardIndex0, uint256 rewardIndex1) {
        if (_tokensOwed0 > 0 && _liquidity > 0) {
            rewardIndex0 = (_tokensOwed0 * 1e20) / _liquidity;
        }
        if (_tokensOwed1 > 0 && _liquidity > 0) {
            rewardIndex1 = (_tokensOwed1 * 1e20) / _liquidity;
        }
    }
}
