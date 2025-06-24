// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {PayMaster} from "../PayMaster.sol";
import {PositionKey} from "../../types/PositionKey.sol";
import {PositionIdLib} from "../../types/PositionId.sol";
import "../../storage/PoolPartyPositionManagerStorage.sol";

library Core {
    using SafeERC20 for ERC20;
    using PositionIdLib for PositionKey;

    function createPosition(
        Storage storage s,
        IPoolPartyPositionManager.CreatePositionParams calldata _params
    ) external returns (PositionId positionId) {
        require(
            _params.permitBatch.details.length == 2,
            "Permit batch must have 2 permit details"
        );
        require(
            _params.permitBatch.spender == address(this),
            "Spender must be this contract"
        );

        IAllowanceTransfer.PermitDetails memory details0 = _params
            .permitBatch
            .details[0];
        IAllowanceTransfer.PermitDetails memory details1 = _params
            .permitBatch
            .details[1];
        address token0 = details0.token;
        address token1 = details1.token;

        // IPoolPartyPositionManager.FeatureSettings
        //     memory featureSettings = _sanitizeFeatureSettings(
        //         _params.featureSettings
        //     );

        IPoolPartyPositionManager.FeatureSettings
            memory featureSettings = _params.featureSettings;

        IPoolPartyPosition poolPosition = s.i_poolPositionFactory.create(
            IPoolPartyPosition.ConstructorParams({
                admin: s.i_admin,
                upgrader: s.i_upgrader,
                manager: address(this),
                nonfungiblePositionManager: s.i_nonfungiblePositionManager,
                uniswapV3Factory: s.i_uniswapV3Factory,
                uniswapV3SwapRouter: s.i_swapRouter,
                usdc: s.i_usdc,
                WETH9: s.i_WETH9,
                operator: msg.sender,
                operatorFee: featureSettings.operatorFee,
                poolPartyRecipient: s.poolPartyRecipient,
                poolPartyFee: s.poolPartyFee,
                token0: token0,
                token1: token1,
                fee: _params.fee,
                tickLower: _params.tickLower,
                tickUpper: _params.tickUpper,
                name: featureSettings.name
            })
        );

        s.i_permit2.permit(msg.sender, _params.permitBatch, _params.signature);
        uint160 amount0Desired = details0.amount;
        uint160 amount1Desired = details1.amount;

        if (poolPosition.inRange() == 0) {
            _transferETHOrToken(
                s,
                poolPosition,
                token0,
                amount0Desired,
                msg.sender,
                address(this)
            );
            _transferETHOrToken(
                s,
                poolPosition,
                token1,
                amount1Desired,
                msg.sender,
                address(this)
            );
        } else if (poolPosition.inRange() == 1) {
            amount0Desired = 0;
            _transferETHOrToken(
                s,
                poolPosition,
                token1,
                amount1Desired,
                msg.sender,
                address(this)
            );
        } else {
            amount1Desired = 0;
            _transferETHOrToken(
                s,
                poolPosition,
                token0,
                amount0Desired,
                msg.sender,
                address(this)
            );
        }

        //slither-disable-next-line unused-return,reentrancy-no-eth
        (positionId, , , , ) = poolPosition.mintPosition(
            IPoolPartyPosition.MintPositionParams({
                amount0Desired: amount0Desired,
                amount1Desired: amount1Desired,
                amount0Min: _params.amount0Min,
                amount1Min: _params.amount1Min,
                deadline: _params.deadline
            })
        );

        s.operatorByPositionId[positionId] = msg.sender;
        s.positionByInvestorAndId[msg.sender][positionId] = address(
            poolPosition
        );
        s.positionsByInvestor[msg.sender].push(address(poolPosition));
        s.featureSettings[positionId] = featureSettings;
        s.positions.push(address(poolPosition));
    }

    function addLiquidity(
        Storage storage s,
        IPoolPartyPositionManager.AddLiquidityParams calldata _params
    ) external returns (uint128 liquidity, uint256 amount0, uint256 amount1) {
        PositionId positionId = _params.positionId;

        IPoolPartyPosition position = s
            .i_poolPositionFactory
            .getPoolPartyPosition(positionId);

        require(address(position) != address(0), "Position does not exist");
        require(!position.isClosed(), "Position is already closed");
        require(_params.permit.details.token == s.i_usdc, "Token must be USDC");
        require(
            _params.permit.spender == address(this),
            "Spender must be this contract"
        );
        address investor = msg.sender;
        address operator = s.operatorByPositionId[positionId];
        if (
            investor != operator &&
            s.positionByInvestorAndId[investor][positionId] == address(0)
        ) {
            s.positionByInvestorAndId[investor][positionId] = address(position);
            s.positionsByInvestor[investor].push(address(position));
        }

        uint256 currentInvLiquidity = IPoolPartyPosition(address(position))
            .liquidityOf(investor);
        if (
            investor != operator &&
            currentInvLiquidity == 0 &&
            !s.positionInvestedBy[positionId][investor]
        ) {
            s.totalInvestorsByPosition[positionId]++;
            s.positionInvestedBy[positionId][investor] = true;
        }

        s.i_permit2.permit(investor, _params.permit, _params.signature);
        uint160 amountUSDC = _params.permit.details.amount;
        s.i_permit2.transferFrom(investor, address(this), amountUSDC, s.i_usdc);

        (uint256 amount0USDC, uint256 amount1USDC) = PayMaster
            .computeUSDCToPairTokenAmounts(position.key(), amountUSDC);

        if (position.inRange() == 1) {
            amount0USDC = 0;
            amount1USDC = amountUSDC;
        } else if (position.inRange() == -1) {
            amount0USDC = amountUSDC;
            amount1USDC = 0;
        }

        //slither-disable-next-line unused-return
        require(
            ERC20(s.i_usdc).approve(address(position), amountUSDC),
            "Approval failed for usdc"
        );

        //slither-disable-next-line unused-return
        return
            position.increaseLiquidty(
                IPoolPartyPosition.IncreaseLiquidityParams({
                    investor: investor,
                    amount0USDC: amount0USDC,
                    amount1USDC: amount1USDC,
                    deadline: _params.deadline,
                    swap: _params.swap,
                    ignoreSlippage: _params.ignoreSlippage
                })
            );
    }

    function removeLiquidity(
        Storage storage s,
        IPoolPartyPositionManager.RemoveLiquidityParams calldata _params
    ) external returns (uint128 liquidity, uint256 amount0, uint256 amount1) {
        uint256 percentage = _params.percentage / PERCENTAGE_MULTIPLIER;
        address investor = msg.sender;

        uint256 percentageToRemove = (s.totalInvestmentsByInvestor[investor] *
            percentage) / 100;

        if (percentageToRemove >= s.totalInvestmentsByInvestor[investor]) {
            s.totalInvestmentsByInvestor[investor] = 0;
        } else {
            s.totalInvestmentsByInvestor[investor] -= percentageToRemove;
        }

        PositionId positionId = _params.positionId;
        IPoolPartyPosition position = s
            .i_poolPositionFactory
            .getPoolPartyPosition(positionId);

        require(address(position) != address(0), "Position does not exist");
        require(!position.isClosed(), "Position is already closed");

        //slither-disable-next-line unused-return
        (liquidity, amount0, amount1) = position.decreaseLiquidity(
            IPoolPartyPosition.DecreaseLiquidityParams({
                investor: investor,
                percentage: _params.percentage,
                amount0Min: _params.amount0Min,
                amount1Min: _params.amount1Min,
                deadline: _params.deadline,
                swap: _params.swap
            })
        );

        address operator = s.operatorByPositionId[positionId];

        if (
            investor != operator &&
            s.positionInvestedBy[positionId][investor] &&
            percentage == 100
        ) {
            if (s.totalInvestorsByPosition[positionId] > 1) {
                s.totalInvestorsByPosition[positionId]--;
            }
            s.positionInvestedBy[positionId][investor] = false;
        }
    }

    function collectRewards(
        Storage storage s,
        IPoolPartyPositionManager.CollectParams calldata _params
    ) external returns (uint256 amount0, uint256 amount1) {
        IPoolPartyPosition position = s
            .i_poolPositionFactory
            .getPoolPartyPosition(_params.positionId);
        require(address(position) != address(0), "Position does not exist");

        //slither-disable-next-line unused-return
        return
            position.collect(
                IPoolPartyPosition.CollectParams({
                    investor: msg.sender,
                    deadline: _params.deadline,
                    swap: _params.swap
                })
            );
    }

    function changeRange() external {}

    function closePool(
        Storage storage s,
        IPoolPartyPositionManager.ClosePoolParams calldata _params
    ) external returns (uint128, uint256, uint256) {
        PositionId positionId = _params.positionId;
        IPoolPartyPosition position = s
            .i_poolPositionFactory
            .getPoolPartyPosition(positionId);
        require(address(position) != address(0), "Position does not exist");
        require(!position.isClosed(), "Position is already closed");

        address operator = msg.sender;
        s.totalInvestmentsByInvestor[operator] = 0;
        s.positionInvestedBy[positionId][operator] = false;

        // aderyn-ignore-next-line
        // slither-disable-next-line unused-return
        return
            position.closePosition(
                IPoolPartyPosition.ClosePositionParams({
                    operator: operator,
                    deadline: _params.deadline
                })
            );
    }

    function withdraw(
        Storage storage s,
        IPoolPartyPositionManager.WithdrawParams calldata _params
    )
        external
        returns (
            uint256 token0,
            uint256 token1,
            uint256 collected0,
            uint256 collected1
        )
    {
        PositionId positionId = _params.positionId;
        IPoolPartyPosition position = s
            .i_poolPositionFactory
            .getPoolPartyPosition(_params.positionId);
        require(address(position) != address(0), "Position does not exist");

        address operator = s.operatorByPositionId[positionId];
        address investor = msg.sender;
        if (
            investor != operator && s.totalInvestorsByPosition[positionId] > 1
        ) {
            s.totalInvestorsByPosition[positionId]--;
        }
        s.totalInvestmentsByInvestor[investor] = 0;
        s.positionInvestedBy[positionId][investor] = false;

        //slither-disable-next-line unused-return
        return
            position.withdraw(
                IPoolPartyPosition.WithdrawParams({
                    investor: investor,
                    deadline: _params.deadline,
                    swap: _params.swap
                })
            );
    }

    /// @notice Transfer ETH to a recipient address if the contract holds enough ETH.
    /// Otherwise, transfer the token to the recipient address using the permit function.
    function _transferETHOrToken(
        Storage storage s,
        IPoolPartyPosition poolPosition,
        address _token,
        uint256 _value,
        address _from,
        address _recipient
    ) private {
        if (_value == 0) {
            return;
        }
        if (_token == s.i_WETH9 && address(this).balance >= _value) {
            TransferHelper.safeTransferETH(address(poolPosition), _value);
        } else {
            s.i_permit2.transferFrom(
                _from,
                _recipient,
                uint160(_value),
                _token
            );
            //slither-disable-next-line unused-return,reentrancy-no-eth
            require(
                ERC20(_token).approve(address(poolPosition), _value),
                "Approval failed for token"
            );
        }
    }

    function resetMaxInvestment(
        Storage storage s,
        address[] memory _accounts
    ) external {
        for (uint256 i = 0; i < _accounts.length; i++) {
            address investor = _accounts[i];
            address[] memory positions = s.positionsByInvestor[investor];
            for (uint256 j = 0; j < positions.length; j++) {
                IPoolPartyPosition position = IPoolPartyPosition(positions[j]);
                PositionId positionId = position.key().toId();
                s.positionInvestedBy[positionId][investor] = false;
            }
            s.totalInvestmentsByInvestor[investor] = 0;
        }
    }

    // function _sanitizeFeatureSettings(
    //     IPoolPartyPositionManager.FeatureSettings calldata _featureSettings
    // ) private pure returns (IPoolPartyPositionManager.FeatureSettings memory) {
    //     return
    //         IPoolPartyPositionManager.FeatureSettings({
    //             name: _sanitizeString(_featureSettings.name),
    //             description: _sanitizeString(_featureSettings.description),
    //             operatorFee: _featureSettings.operatorFee,
    //             hiddenFields: _featureSettings.hiddenFields
    //         });
    // }

    // function _sanitizeString(
    //     string memory str
    // ) private pure returns (string memory) {
    //     bytes memory b = bytes(str);
    //     bytes memory sanitized = new bytes(b.length);
    //     uint count = 0;

    //     for (uint i = 0; i < b.length; i++) {
    //         bytes1 char = b[i];
    //         // Allow only alphanumeric characters and specific symbols
    //         if (
    //             (char >= 0x30 && char <= 0x39) || // 0-9
    //             (char >= 0x41 && char <= 0x5A) || // A-Z
    //             (char >= 0x61 && char <= 0x7A) || // a-z
    //             char == 0x20 || // Space
    //             char == 0x2B || // +
    //             char == 0x26 || // &
    //             char == 0x23 || // #
    //             char == 0x3B || // ;
    //             char == 0x5C || // \
    //             char == 0x2F || // /
    //             char == 0x40 || // @
    //             char == 0x21 || // !
    //             char == 0x24 || // $
    //             char == 0x25 || // %
    //             char == 0x28 || // (
    //             char == 0x29 || // )
    //             char == 0x2D || // -
    //             char == 0x5F || // _
    //             char == 0x27 || // ' (single quote)
    //             char == 0x22 || // " (double quote)
    //             char == 0x3A || // : (colon)
    //             char == 0x2E || // . (period)
    //             char == 0x7E || // ~ (tilde)
    //             char == 0x7B || // { (left curly brace)
    //             char == 0x7D || // } (right curly brace)
    //             char == 0x5B || // [ (left square bracket)
    //             char == 0x5D || // ] (right square bracket)
    //             char == 0x3D // = (equals sign)
    //         ) {
    //             sanitized[count] = char;
    //             count++;
    //         }
    //         // Handle emoji (multi-byte UTF-8 characters)
    //         else if (i < b.length - 3 && ((uint8(b[i]) & 0xF0) == 0xF0)) {
    //             // Emoji typically start with byte 0xF0 (4-byte UTF-8)
    //             // Emoji are 4 bytes long, so we need to include all four bytes
    //             sanitized[count] = b[i];
    //             sanitized[count + 1] = b[i + 1];
    //             sanitized[count + 2] = b[i + 2];
    //             sanitized[count + 3] = b[i + 3];
    //             count += 4;
    //             i += 3; // Skip the next 3 bytes as they're part of this emoji
    //         }
    //     }

    //     // Create a new bytes array with the exact size of valid characters
    //     bytes memory trimmedSanitized = new bytes(count);
    //     for (uint i = 0; i < count; i++) {
    //         trimmedSanitized[i] = sanitized[i];
    //     }

    //     return string(trimmedSanitized);
    // }
}
