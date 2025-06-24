// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.26;

import {IUniswapV3Pool} from "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import {PositionKey} from "../../types/PositionKey.sol";
import {PositionIdLib} from "../../types/PositionId.sol";
import "../../storage/PoolPartyPositionManagerStorage.sol";

library View {
    using PositionIdLib for PositionKey;

    function operatorPositions(
        Storage storage s,
        address _operator
    ) external view returns (address[] memory) {
        return s.positionsByInvestor[_operator];
    }

    function operatorPosition(
        Storage storage s,
        PositionId _positionId
    ) external view returns (address) {
        address operator = s.operatorByPositionId[_positionId];
        return s.positionByInvestorAndId[operator][_positionId];
    }

    function investorPositions(
        Storage storage s,
        address _investor
    ) external view returns (address[] memory) {
        return s.positionsByInvestor[_investor];
    }

    function investorPosition(
        Storage storage s,
        address _investor,
        PositionId _positionId
    ) external view returns (address) {
        return s.positionByInvestorAndId[_investor][_positionId];
    }

    function allPositions(
        Storage storage s
    ) external view returns (address[] memory) {
        return s.positions;
    }

    function listOfPositionDataBy(
        Storage storage s,
        address _account,
        address[] calldata _positions
    )
        external
        view
        returns (IPoolPartyPositionManager.InvestorPositionData[] memory)
    {
        require(_account != address(0), "Account cannot be the zero address");

        uint256 length = _positions.length;
        require(_positions.length <= 500, "Too many positions");

        IPoolPartyPositionManager.InvestorPositionData[]
            memory positions = new IPoolPartyPositionManager.InvestorPositionData[](
                length
            );

        if (length == 0) {
            return positions;
        }

        //slither-disable-start calls-loop
        for (uint256 i = 0; i < length; i++) {
            IPoolPartyPosition position = IPoolPartyPosition(_positions[i]);
            PositionKey memory positionKey = position.key();
            require(positionKey.pool != address(0), "Position does not exist");

            PositionId positionId = positionKey.toId();
            IPoolPartyPosition _investorPosition = IPoolPartyPosition(
                s.positionByInvestorAndId[_account][positionId]
            );

            if (address(_investorPosition) == address(0)) {
                continue;
            }

            uint256 totalInvestors = s.totalInvestorsByPosition[positionId];

            positions[i] = IPoolPartyPositionManager.InvestorPositionData({
                positionId: positionId,
                pool: address(position),
                token0: positionKey.token0,
                token1: positionKey.token1,
                tokenId: position.tokenId(),
                amount0: position.balance0Of(_account),
                amount1: position.balance1Of(_account),
                rewards0: position.calculateRewards0Earned(_account),
                rewards1: position.calculateRewards1Earned(_account),
                fee: positionKey.fee,
                totalInvestors: totalInvestors
            });
        }
        //slither-disable-end calls-loop
        return positions;
    }

    function positionData(
        Storage storage s,
        address _position
    ) public view returns (IPoolPartyPositionManager.PositionData memory) {
        require(_position != address(0), "Position cannot be the zero address");

        IPoolPartyPosition position = IPoolPartyPosition(_position);
        PositionKey memory positionKey = position.key();
        require(positionKey.pool != address(0), "Position does not exist");

        PositionId positionId = positionKey.toId();

        (uint160 sqrtPriceX96Pool, , , , , , ) = IUniswapV3Pool(
            positionKey.pool
        ).slot0();

        uint256 totalInvestors = s.totalInvestorsByPosition[positionId];

        return
            IPoolPartyPositionManager.PositionData({
                positionId: positionId,
                pool: address(position),
                operator: positionKey.operator,
                token0: positionKey.token0,
                token1: positionKey.token1,
                totalSupply0: position.totalSupply0(),
                totalSupply1: position.totalSupply1(),
                tokenId: position.tokenId(),
                fee: positionKey.fee,
                tickLower: positionKey.tickLower,
                tickUpper: positionKey.tickUpper,
                inRange: position.inRange(),
                closed: position.isClosed(),
                featureSettings: s.featureSettings[positionId],
                totalInvestors: totalInvestors,
                uniswapV3Pool: positionKey.pool,
                sqrtPriceX96Pool: sqrtPriceX96Pool
            });
    }
}
