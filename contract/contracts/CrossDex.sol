// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IWrappedNative} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IWrappedNative.sol";

contract CrossDex {
    error PriceFeedAndTokensLengthNotEqual();
    error TokenNotSwappable(address _baseToken, address _quoteToken);
    error AmountOutOfBounds();
    error NotEnoughBalance(uint256 _value);

    uint256 private constant NEW_PRECISION = 1e10;
    uint256 private constant PRECISION = 1e18;
    mapping(address => TokenData) public s_tokenDatas;

    struct TokenData {
        bytes32 priceFeed;
        string symbol;
    }

    constructor(TokenData[] memory _tokenDatas, address[] memory _tokens) {
        if (_tokenDatas.length != _tokens.length) {
            revert PriceFeedAndTokensLengthNotEqual();
        }
        for (uint i = 0; i < _tokenDatas.length; i++) {
            if (_tokens[i] != address(0)) {
                s_tokenDatas[_tokens[i]] = _tokenDatas[i];
            }
        }
    }
}
