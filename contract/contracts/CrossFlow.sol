// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {IAny2EVMMessageReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IAny2EVMMessageReceiver.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {IWrappedNative} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IWrappedNative.sol";
import {CrossDex} from "./CrossDex.sol";

contract CrossFlow is IAny2EVMMessageReceiver, OwnerIsCreator, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum PayFeesIn {
        NATIVE,
        LINK
    }

    enum TokenType {
        SUPPORTED,
        NOTSUPPORTED,
        WRAPPED,
        NATIVE
    }

    error InvalidRouter(address router);
    error ChainNotEnabled(uint64 chainSelector);
    error SenderNotEnabled(address sender);
    error NotEnoughBalanceForFees(
        uint256 currentBalance,
        uint256 calculatedFees
    );
    error OperationNotAllowedOnCurrentChain(uint64 chainSelector);

    IRouterClient internal immutable i_ccipRouter;
    LinkTokenInterface internal immutable i_linkToken;
    IWrappedNative public immutable i_weth;
    IERC20 public immutable i_usdcToken;
    address payable private i_dex;
    uint64 private immutable i_currentChainSelector;

    mapping(uint64 destChainSelector => XFlowDetails xFlowDetailsPerChain)
        public s_chains;
    mapping(string => address) public assetAddress;

    event ChainEnabled(
        uint64 chainSelector,
        address xFlowAddress,
        bytes ccipExtraArgs
    );
    event ChainDisabled(uint64 chainSelector);
    event CrossChainSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address indexed sender,
        address to,
        address token,
        uint256 tokenAmount,
        address feeToken,
        uint256 fees
    );
    event CrossChainReceived(
        bytes32 indexed _messageId,
        uint64 indexed _sourceChainSelector,
        address _sender,
        address indexed _to,
        address token,
        uint256 tokenAmount
    );

    struct XFlowDetails {
        address xFlowAddress;
        bytes ccipExtraArgsBytes;
    }

    modifier onlyEnabledChain(uint64 _chainSelector) {
        if (s_chains[_chainSelector].xFlowAddress == address(0))
            revert ChainNotEnabled(_chainSelector);
        _;
    }

    modifier onlyEnabledSender(uint64 _chainSelector, address _sender) {
        if (s_chains[_chainSelector].xFlowAddress != _sender)
            revert SenderNotEnabled(_sender);
        _;
    }

    modifier onlyRouter() {
        if (msg.sender != address(i_ccipRouter))
            revert InvalidRouter(msg.sender);
        _;
    }

    modifier onlyOtherChains(uint64 _chainSelector) {
        if (_chainSelector == i_currentChainSelector)
            revert OperationNotAllowedOnCurrentChain(_chainSelector);
        _;
    }

    constructor(
        address ccipRouterAddress,
        address linkTokenAddress,
        uint64 currentChainSelector,
        address usdcToken,
        address dex
    ) {
        if (ccipRouterAddress == address(0)) revert InvalidRouter(address(0));
        i_ccipRouter = IRouterClient(ccipRouterAddress);
        i_linkToken = LinkTokenInterface(linkTokenAddress);
        i_currentChainSelector = currentChainSelector;
        i_weth = IWrappedNative(
            CCIPRouter(ccipRouterAddress).getWrappedNative()
        );
        i_weth.approve(ccipRouterAddress, type(uint256).max);
        i_dex = payable(dex);
        i_weth.approve(dex, type(uint256).max);
        i_usdcToken = IERC20(usdcToken);
    }

    function enableChain(
        uint64 chainSelector,
        address xFlowAddress,
        bytes memory ccipExtraArgs
    ) external onlyOwner onlyOtherChains(chainSelector) {
        s_chains[chainSelector] = XFlowDetails({
            xFlowAddress: xFlowAddress,
            ccipExtraArgsBytes: ccipExtraArgs
        });

        emit ChainEnabled(chainSelector, xFlowAddress, ccipExtraArgs);
    }

    function disableChain(
        uint64 chainSelector
    ) external onlyOwner onlyOtherChains(chainSelector) {
        delete s_chains[chainSelector];

        emit ChainDisabled(chainSelector);
    }

    function crossChainTransferFrom(
        uint64 destinationChainSelector,
        address to,
        address token,
        uint256 amount,
        TokenType tokenType,
        PayFeesIn payFeesIn,
        string calldata descSymbol
    )
        external
        nonReentrant
        onlyEnabledChain(destinationChainSelector)
        returns (bytes32 messageId)
    {
        address fromToken = token;

        if (tokenType == TokenType.NATIVE) {
            i_weth.deposit{value: amount}();
        }

        if (tokenType == TokenType.WRAPPED) {
            i_weth.transferFrom(msg.sender, address(this), amount);
        }

        if (tokenType == TokenType.NOTSUPPORTED) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            IERC20(token).approve(address(i_dex), amount);
            (bool success, uint256 swapAmount) = CrossDex(i_dex).swap(
                token,
                address(i_usdcToken),
                amount
            );
            token = address(i_usdcToken);
            amount = swapAmount;
        }

        if (tokenType == TokenType.SUPPORTED) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(
                s_chains[destinationChainSelector].xFlowAddress
            ),
            data: abi.encode(to, msg.sender, tokenType, descSymbol),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: s_chains[destinationChainSelector].ccipExtraArgsBytes,
            feeToken: payFeesIn == PayFeesIn.LINK
                ? address(i_linkToken)
                : address(0)
        });

        // Get the fee required to send the CCIP message
        uint256 fees = i_ccipRouter.getFee(destinationChainSelector, message);

        if (payFeesIn == PayFeesIn.LINK) {
            if (fees > i_linkToken.balanceOf(address(msg.sender)))
                revert NotEnoughBalanceForFees(
                    i_linkToken.balanceOf(address(msg.sender)),
                    fees
                );

            // Approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
            i_linkToken.approve(address(i_ccipRouter), fees);
            i_linkToken.transferFrom(msg.sender, address(this), fees);

            // Send the message through the router and store the returned message ID
            messageId = i_ccipRouter.ccipSend(
                destinationChainSelector,
                message
            );
        } else {
            if (fees > address(this).balance)
                revert NotEnoughBalanceForFees(address(this).balance, fees);

            // Send the message through the router and store the returned message ID
            messageId = i_ccipRouter.ccipSend{value: fees}(
                destinationChainSelector,
                message
            );
        }

        emit CrossChainSent(
            messageId,
            destinationChainSelector,
            msg.sender,
            to,
            fromToken,
            amount,
            payFeesIn == PayFeesIn.LINK ? address(i_linkToken) : address(0),
            fees
        );
    }

    /// @inheritdoc IAny2EVMMessageReceiver
    function ccipReceive(
        Client.Any2EVMMessage calldata message
    )
        external
        virtual
        override
        onlyRouter
        nonReentrant
        onlyEnabledChain(message.sourceChainSelector)
        onlyEnabledSender(
            message.sourceChainSelector,
            abi.decode(message.sender, (address))
        )
    {
        bytes32 messageId = message.messageId;
        uint64 sourceChainSelector = message.sourceChainSelector;
        (
            address to,
            address from,
            TokenType tokenType,
            string memory descSymbol
        ) = abi.decode(message.data, (address, address, TokenType, string));
        address token = message.destTokenAmounts[0].token;
        uint256 tokenAmount = message.destTokenAmounts[0].amount;

        address destAddress = assetAddress[descSymbol];

        if (
            (TokenType.NATIVE == tokenType || TokenType.WRAPPED == tokenType) &&
            destAddress == address(1)
        ) {
            i_weth.withdraw(tokenAmount);
            (bool success, ) = payable(to).call{value: tokenAmount}("");
            if (!success) {
                i_weth.deposit{value: tokenAmount}();
                i_weth.transfer(to, tokenAmount);
            }
        }

        if (
            (TokenType.SUPPORTED == tokenType ||
                TokenType.NOTSUPPORTED == tokenType) &&
            destAddress == address(1)
        ) {
            IERC20(token).approve(address(i_dex), tokenAmount);
            (bool success, uint256 swapAmount) = CrossDex(i_dex).swap(
                token,
                destAddress,
                tokenAmount
            );
            (bool _success, ) = payable(to).call{value: tokenAmount}("");
            if (!_success) {
                i_weth.deposit{value: tokenAmount}();
                i_weth.transfer(to, tokenAmount);
            }
        }

        if (
            (TokenType.SUPPORTED == tokenType ||
                TokenType.NOTSUPPORTED == tokenType) && destAddress != token
        ) {
            IERC20(token).approve(address(i_dex), tokenAmount);
            (bool success, uint256 swapAmount) = CrossDex(i_dex).swap(
                token,
                destAddress,
                tokenAmount
            );
            IERC20(destAddress).transfer(to, tokenAmount);
        } else {
            IERC20(token).transfer(to, tokenAmount);
        }

        emit CrossChainReceived(
            messageId,
            sourceChainSelector,
            from,
            to,
            token,
            tokenAmount
        );
    }
}

interface CCIPRouter {
    function getWrappedNative() external view returns (address);
}
