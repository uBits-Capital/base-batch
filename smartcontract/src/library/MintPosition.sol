// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {PayMaster} from "./PayMaster.sol";
import {Liquidity} from "./Liquidity.sol";
import {UniswapV3Integration} from "./UniswapV3Integration.sol";
import {Storage} from "../storage/PoolPartyPositionStorage.sol";
import "../interfaces/IPoolPartyPosition.sol";

library MintPosition {
    using PositionIdLib for PositionKey;
    using SafeERC20 for IERC20;

    function mintPosition(
        Storage storage s,
        IPoolPartyPositionView _position,
        address _recipient,
        IPoolPartyPosition.MintPositionParams memory _params
    )
        external
        returns (
            PositionId positionId,
            uint256 _tokenId,
            uint128 _liquidity,
            uint256 amount0,
            uint256 amount1
        )
    {
        //slither-disable-next-line timestamp
        require(
            _params.deadline >= block.timestamp,
            "Deadline must be in the future"
        );
        require(
            _params.amount0Desired > 0 || _params.amount1Desired > 0,
            "At least one of amount0Desired or amount1Desired must be greater than 0"
        );

        PayMaster.wrapETHOrTransferToken(
            _position,
            s.i_token0,
            _params.amount0Desired,
            msg.sender,
            _recipient
        );

        PayMaster.wrapETHOrTransferToken(
            _position,
            s.i_token1,
            _params.amount1Desired,
            msg.sender,
            _recipient
        );

        //slither-disable-next-line unused-return,reentrancy-no-eth
        require(
            IERC20(s.i_token0).approve(
                address(s.i_nonfungiblePositionManager),
                _params.amount0Desired
            ),
            "Approval failed for i_token0"
        );
        //slither-disable-next-line unused-return,reentrancy-no-eth
        require(
            IERC20(s.i_token1).approve(
                address(s.i_nonfungiblePositionManager),
                _params.amount1Desired
            ),
            "Approval failed for i_token1"
        );
        //slither-disable-next-line reentrancy-no-eth,locked-ether
        (_tokenId, _liquidity, amount0, amount1) = UniswapV3Integration.mint({
            s: s,
            _recipient: _recipient,
            _amount0Desired: _params.amount0Desired,
            _amount1Desired: _params.amount1Desired,
            _amount0Min: _params.amount0Min,
            _amount1Min: _params.amount1Min,
            _deadline: _params.deadline
        });

        s.tokenId = _tokenId;

        try
            UniswapV3Integration.getAmountsFromLiquidity(s, _liquidity)
        returns (uint256 _amount0, uint256 _amount1) {
            if (_amount0 > amount0 || _amount1 > amount1) {
                revert("Invalid liquidity amount calculation");
            }
        } catch {
            revert("Invalid liquidity amount calculation");
        }

        if (_params.amount0Desired - amount0 > 0) {
            PayMaster.refundWithUnwrapedWETHOrToken(
                _position,
                s.i_token0,
                _params.amount0Desired - amount0,
                s.i_operator
            );
        }

        if (_params.amount1Desired - amount1 > 0) {
            PayMaster.refundWithUnwrapedWETHOrToken(
                _position,
                s.i_token1,
                _params.amount1Desired - amount1,
                s.i_operator
            );
        }

        s.liquidity = _liquidity;

        s.liquidityOf[s.i_operator] = _liquidity;

        positionId = s.positionKey.toId();
        s.isOpen[positionId][s.tokenId] = true;

        emit IPoolPartyPosition.PositionCreated(
            s.i_operator,
            s.tokenId,
            positionId,
            _recipient
        );
    }
}
