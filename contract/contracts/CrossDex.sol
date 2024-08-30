// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IWrappedNative} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IWrappedNative.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CrossDex is ReentrancyGuard, OwnerIsCreator {
    using SafeERC20 for IERC20;

    error PriceFeedAndTokensLengthNotEqual();
    error TokenNotSwappable(address _baseToken, address _quoteToken);
    error AmountOutOfBounds();
    error NotEnoughBalance(uint256 _value);

    uint8 private s_quotePercent = 50;
    uint256 private constant NEW_PRECISION = 1e10;
    uint256 private constant PRECISION = 1e18;
    mapping(address => TokenData) public s_tokenDatas;

    event TokenSwapped(
        string indexed _from,
        string indexed _to,
        uint256 _amount
    );

    struct TokenData {
        address priceFeed;
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

    function swap(
        address _baseToken,
        address _quoteToken,
        uint256 _amount
    ) external payable nonReentrant returns (bool success, uint256 _value) {
        if (_baseToken == address(1) && _amount > msg.value) {
            revert NotEnoughBalance(msg.value);
        }
        uint256 basePrice = getUsdValue(_baseToken, 1);
        uint256 quotePrice = getUsdValue(_quoteToken, 1);
        uint256 quoteSize = (_amount * basePrice) / quotePrice;

        if (!_notLargerThanPercent(_quoteToken, quoteSize))
            revert AmountOutOfBounds();

        if (_baseToken != address(1))
            IERC20(_baseToken).safeTransferFrom(
                msg.sender,
                address(this),
                _amount
            );

        if (_quoteToken != address(1)) {
            IERC20(_quoteToken).safeTransfer(msg.sender, quoteSize);
            success = true;
        } else {
            (success, ) = payable(msg.sender).call{value: quoteSize}("");
        }

        TokenData memory _from = s_tokenDatas[_baseToken];
        TokenData memory _to = s_tokenDatas[_quoteToken];

        if (success) {
            emit TokenSwapped(_from.symbol, _to.symbol, _amount);
            return (success, quoteSize);
        }
    }

    function getUsdValue(
        address _token,
        uint256 _amount
    ) public view returns (uint256) {
        AggregatorV3Interface _priceFeed = AggregatorV3Interface(
            s_tokenDatas[_token].priceFeed
        );
        (, int256 _price, , , ) = _priceFeed.latestRoundData();
        return ((uint256(_price) * NEW_PRECISION) * _amount) / PRECISION;
    }

    function setTokenData(
        address _token,
        TokenData calldata _tokenData
    ) external onlyOwner {
        s_tokenDatas[_token] = _tokenData;
    }

    function setQuotePercent(uint8 _percent) external onlyOwner {
        s_quotePercent = _percent;
    }

    function depositWeth(address _token) external payable {
        IWrappedNative(_token).deposit{value: msg.value}();
    }

    /// note: this function will be removed when deploying to mainnet. It is only here to recover testnet funds incase we make changes and redeploy.
    function withdrawToken(
        address _token
    ) external onlyOwner returns (bool _success) {
        if (_token == address(1)) {
            (_success, ) = payable(msg.sender).call{
                value: address(this).balance
            }("");
        } else {
            uint256 balance = IERC20(_token).balanceOf(address(this));
            _success = IERC20(_token).transfer(msg.sender, balance);
        }
    }

    receive() external payable {}

    function _notLargerThanPercent(
        address _token,
        uint256 _amount
    ) internal view returns (bool) {
        uint256 percentAmount = _token == address(1)
            ? ((s_quotePercent * address(this).balance) / 100)
            : s_quotePercent * (IERC20(_token).balanceOf(address(this)) / 100);
        if (_amount > percentAmount) {
            return false;
        }
        return true;
    }
}
